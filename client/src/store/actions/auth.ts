import * as actions from '.';
import { firebaseApp } from '../../firebase/firebase';
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

  RESEND_EMAIL_SUCCESS: 'RESEND_EMAIL_SUCCESS',
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
          dispatch(initialAuthCheckSuccess(false, null, false));
        } else {
          const result = await fetch('http://localhost:3001/auth/details', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (result.status === 200) {
            const resultData = await result.json();
            dispatch(actions.setProfile(resultData.profile));
            dispatch(
              initialAuthCheckSuccess(
                true,
                token,
                resultData.waitingForEmailConfirmation
              )
            );
          } else {
            localStorage.removeItem('jwtToken');
            dispatch(initialAuthCheckSuccess(false, null, false));
          }
        }
      } catch (error) {
        localStorage.removeItem('jwtToken');
        dispatch(initialAuthCheckSuccess(false, null, false));
      }
    }
  };
};

export const registerWithEmailAndPassword = (
  email: string,
  password: string
) => {
  return auth('http://localhost:3001/auth/registerWithEmailPassword', {
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
  return auth('http://localhost:3001/auth/loginWithEmailPassword', {
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

export const loginWithGoogle = (googleTokenId: string) => {
  return auth('http://localhost:3001/auth/loginWithGoogle', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idToken: googleTokenId
    })
  });
};

const auth = (authUrl: string, fetchParams: any) => {
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
        dispatch(loginSuccess(token, resultData.waitingForEmailConfirmation));
      } else {
        dispatch(
          loginFailed(result.status !== 500 ? resultData.msg : internalError)
        );
      }
    } catch (error) {
      console.log('auth failed', error);
      localStorage.removeItem('jwtToken');
      dispatch(loginFailed(internalError));
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
      //TODO reset other stores
      dispatch(actions.resetProfileStore());
      dispatch(logoutSuccess());
    }
  };
};

export const sendConfirmationEmail = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(authOperationStart());
      const token = getState().auth.token;
      const response = await fetch(
        'http://localhost:3001/auth/sendConfirmationEmail',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.status !== 200) {
        dispatch(authOperationFailed('Failed to resend confirmation error'));
      } else {
        dispatch(resendEmailSuccess());
      }
    } catch (error) {
      console.log('Failed to resend confirmation error');
    }
  };
};

export const confirmEmail = (confirmationToken: string) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(authOperationStart());
      const token = getState().auth.token;
      const response = await fetch(
        'http://localhost:3001/auth/confirmEmail',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            confirmationToken
          })
        }
      );
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
      // dispatch(authOperationStart());
      // const token = getState().auth.token;
      // const response = await fetch(
      //   'http://localhost:3001/auth/confirmEmail',
      //   {
      //     method: 'POST',
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({
      //       confirmationToken
      //     })
      //   }
      // );
      // if (response.status !== 200) {
      //   dispatch(authOperationFailed('Email confirmation failed'));
      // } else {
      //   dispatch(confirmEmailSuccess());
      // }
    } catch (error) {
      dispatch(authOperationFailed('Password reset request failed'));
    }
  };
}

export const authInit = () => {
  return {
    type: AuthActionTypes.AUTH_INIT
  }
}

export const setAuthRedirectPath = (path: string) => {
  return {
    type: AuthActionTypes.SET_AUTH_REDIRECT_PATH,
    path
  };
};

export const loginSuccess = (
  token: string,
  waitingForEmailConfirmation: boolean
) => {
  return {
    type: AuthActionTypes.AUTH_SUCCESS,
    token,
    waitingForEmailConfirmation
  };
};

export const loginFailed = (error: string) => {
  return {
    type: AuthActionTypes.AUTH_FAILED,
    error
  };
};

export const logoutSuccess = () => {
  return {
    type: AuthActionTypes.LOGOUT_SUCCESS
  };
};

export const initialAuthCheckSuccess = (
  isLoggedIn: boolean,
  token: string | null,
  waitingForEmailConfirmation: boolean
) => {
  return {
    type: AuthActionTypes.INITIAL_AUTH_CHECK_SUCCESS,
    isLoggedIn,
    token,
    waitingForEmailConfirmation
  };
};

export const authOperationStart = () => {
  return {
    type: AuthActionTypes.AUTH_OPERATION_START
  };
};

export const authOperationFailed = (error: string) => {
  return {
    type: AuthActionTypes.AUTH_OPERATION_FAILED,
    error
  };
};

export const resendEmailSuccess = () => {
  return {
    type: AuthActionTypes.RESEND_EMAIL_SUCCESS
  };
};

export const confirmEmailSuccess = () => {
  return {
    type: AuthActionTypes.CONFIRM_EMAIL_SUCCESS
  };
};
