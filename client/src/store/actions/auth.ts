/*
 * Copyright (C) 2020 Evgenia Lazareva
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as actions from '.';
import { firebaseApp } from '../../firebase/firebase';
import env from '../../secret/environment';
import { State } from '../reducers/state';

export const AuthActionTypes = {
  AUTH_INIT: 'AUTH_INIT',
  AUTH_OPERATION_START: 'AUTH_OPERATION_START',

  INITIAL_AUTH_CHECK_SUCCESS: 'INITIAL_AUTH_CHECK_SUCCESS',

  SET_AUTH_REDIRECT_PATH: 'SET_AUTH_REDIRECT_PATH',

  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILED: 'AUTH_FAILED',

  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS',

  AUTH_OPERATION_FAILED: 'AUTH_OPERATION_FAILED',

  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
  REQUEST_PASSWORD_RESET_SUCCESS: 'REQUEST_PASSWORD_RESET_SUCCESS',
  RESEND_CONFIRMATION_EMAIL_SUCCESS: 'RESEND_CONFIRMATION_EMAIL_SUCCESS',
  CONFIRM_EMAIL_SUCCESS: 'CONFIRM_EMAIL_SUCCESS'
};

const internalError =
  'Internal error occurred. Please check your internet connection and try again';

export const checkInitialAuthState = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    if (!getState().auth.initialCheckDone) {
      try {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
          dispatch(initialAuthCheckSuccess(false, null, false, false));
        } else {
          const result = await fetch(`${env.serverUrl}/auth/details`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (result.status === 200) {
            const resultData = await result.json();
            dispatch(actions.setProfile(resultData.profile));
            dispatch(actions.setNotificationSettings(resultData.notificationSettings));
            dispatch(actions.setSocketsEnabled(resultData.socketsEnabled));
            dispatch(
              initialAuthCheckSuccess(
                true,
                token,
                resultData.isAdmin,
                resultData.waitingForEmailConfirmation
              )
            );
            dispatch(actions.fetchStatusList());
          } else {
            if ('caches' in window) {
              caches.delete('app-details');
            }
            localStorage.removeItem('jwtToken');
            dispatch(initialAuthCheckSuccess(false, null, false, false));
          }
        }
      } catch (error) {
        if ('caches' in window) {
          caches.delete('app-details');
        }
        localStorage.removeItem('jwtToken');
        dispatch(initialAuthCheckSuccess(false, null, false, false));
      }
    }
  };
};

export const registerWithEmailAndPassword = (
  email: string,
  password: string
) => {
  return auth(`${env.serverUrl}/auth/registerWithEmailPassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });
};

export const loginWithEmailAndPassword = (email: string, password: string) => {
  return auth(`${env.serverUrl}/auth/loginWithEmailPassword`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });
};

export const loginWithGoogle = (
  googleTokenId: string,
  onOperationDone: any
) => {
  return auth(
    `${env.serverUrl}/auth/loginWithGoogle`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idToken: googleTokenId
      })
    },
    onOperationDone
  );
};

export const loginWithFacebook = (
  facebookUserId: string,
  facebookAccessToken: string,
  onOperationDone: any
) => {
  return auth(
    `${env.serverUrl}/auth/loginWithFacebook`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: facebookUserId,
        accessToken: facebookAccessToken
      })
    },
    onOperationDone
  );
};

const auth = (authUrl: string, fetchParams: any, onOperationDone?: any) => {
  return async (dispatch: (...args: any[]) => void) => {
    try {
      dispatch(authOperationStart());
      const result = await fetch(authUrl, fetchParams);

      const resultData = await result.json();
      if (result.status === 200 || result.status === 201) {
        const token = resultData.token;
        localStorage.setItem('jwtToken', token);

        await firebaseApp.doSignIn();
        dispatch(actions.setProfile(resultData.profile));
        dispatch(actions.setNotificationSettings(resultData.notificationSettings));
        dispatch(actions.setSocketsEnabled(resultData.socketsEnabled));
        dispatch(
          loginSuccess(
            token,
            resultData.isAdmin,
            resultData.waitingForEmailConfirmation
          )
        );
        dispatch(actions.fetchStatusList());
      } else {
        let message = internalError;
        if (result.status === 422) {
          message = resultData.data[0].errorMessage;
        } else if (result.status !== 500) {
          message = resultData.message;
        }
        dispatch(
          loginFailed(message)
        );
      }
    } catch (error) {
      console.log('auth failed', error);
      localStorage.removeItem('jwtToken');
      dispatch(loginFailed(internalError));
    } finally {
      if (onOperationDone) {
        onOperationDone();
      }
    }
  };
};

export const logout = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      if (getState().auth.isLoggedIn) {
        await firebaseApp.doSignOut();
      }
    } finally {
      localStorage.removeItem('jwtToken');
      if ('caches' in window) {
        caches.delete('app-details');
      }
      dispatch(actions.resetProfileStore());
      dispatch(actions.resetContactsStore());
      dispatch(actions.resetNotificationsStore());
      dispatch(actions.resetSocketStore());
      dispatch(logoutSuccess());
    }
  };
};

export const sendConfirmationEmail = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    const errorMessage =
      'Sending confirmation email failed. Please check your internet connection and try again';
    try {
      dispatch(authOperationStart());
      const token = getState().auth.token;
      const response = await fetch(
        `${env.serverUrl}/auth/sendConfirmationEmail`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.status !== 200) {
        dispatch(authOperationFailed(errorMessage));
      } else {
        dispatch(resendConfirmationEmailSuccess());
      }
    } catch (error) {
      console.log(error);
      dispatch(authOperationFailed(errorMessage));
    }
  };
};

export const confirmEmail = (confirmationToken: string) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(authOperationStart());
      const token = getState().auth.token;
      const response = await fetch(`${env.serverUrl}/auth/confirmEmail`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmationToken
        })
      });
      if (response.status !== 200) {
        dispatch(authOperationFailed('Email confirmation failed'));
      } else {
        dispatch(confirmEmailSuccess());
      }
    } catch (error) {
      dispatch(authOperationFailed('Email confirmation failed'));
    }
  };
};

export const requestPasswordReset = (email: string) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(authOperationStart());
      const response = await fetch(
        `${env.serverUrl}/auth/sendPasswordResetEmail`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email
          })
        }
      );
      if (response.status === 200) {
        dispatch(requestPasswordResetSuccess());
      } else if (response.status === 422) {
        const responseData = await response.json();
        dispatch(authOperationFailed(responseData.data[0].errorMessage));
      } else {
        dispatch(authOperationFailed('Password reset request failed'));
      }
    } catch (error) {
      dispatch(authOperationFailed('Password reset request failed'));
    }
  };
};

export const resetPassword = (password: string, resetPasswordToken: string) => {
  const errorMessage =
    'Password reset failed. Please check your internet connection and make sure you are using the latest requested link from your inbox';
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(authOperationStart());
      const response = await fetch(`${env.serverUrl}/auth/resetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password,
          resetPasswordToken
        })
      });
      if (response.status === 200) {
        dispatch(passwordResetSuccess());
      } else {
        dispatch(authOperationFailed(errorMessage));
      }
    } catch (error) {
      dispatch(authOperationFailed(errorMessage));
    }
  };
};

export const authInit = () => {
  return {
    type: AuthActionTypes.AUTH_INIT
  };
};

export const setAuthRedirectPath = (path: string) => {
  return {
    type: AuthActionTypes.SET_AUTH_REDIRECT_PATH,
    path
  };
};

const loginSuccess = (
  token: string,
  isAdmin: boolean,
  waitingForEmailConfirmation: boolean
) => {
  return {
    type: AuthActionTypes.AUTH_SUCCESS,
    token,
    isAdmin,
    waitingForEmailConfirmation
  };
};

const loginFailed = (error: string) => {
  return {
    type: AuthActionTypes.AUTH_FAILED,
    error
  };
};

const logoutSuccess = () => {
  return {
    type: AuthActionTypes.LOGOUT_SUCCESS
  };
};

const initialAuthCheckSuccess = (
  isLoggedIn: boolean,
  token: string | null,
  isAdmin: boolean,
  waitingForEmailConfirmation: boolean
) => {
  return {
    type: AuthActionTypes.INITIAL_AUTH_CHECK_SUCCESS,
    isLoggedIn,
    token,
    isAdmin,
    waitingForEmailConfirmation
  };
};

const authOperationStart = () => {
  return {
    type: AuthActionTypes.AUTH_OPERATION_START
  };
};

const authOperationFailed = (error: string) => {
  return {
    type: AuthActionTypes.AUTH_OPERATION_FAILED,
    error
  };
};

const resendConfirmationEmailSuccess = () => {
  return {
    type: AuthActionTypes.RESEND_CONFIRMATION_EMAIL_SUCCESS
  };
};

const requestPasswordResetSuccess = () => {
  return {
    type: AuthActionTypes.REQUEST_PASSWORD_RESET_SUCCESS
  };
};

const passwordResetSuccess = () => {
  return {
    type: AuthActionTypes.PASSWORD_RESET_SUCCESS
  };
};

const confirmEmailSuccess = () => {
  return {
    type: AuthActionTypes.CONFIRM_EMAIL_SUCCESS
  };
};
