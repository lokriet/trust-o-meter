import { StitchUser } from 'mongodb-stitch-browser-sdk';

import { app } from '../../stitch/app';
import {
  hasLoggedInUser,
  loginWithEmailPassword,
  logoutCurrentUser,
  registerWithEmailPassword,
} from '../../stitch/authentication';
import { State } from '../reducers/state';

export const AuthActionTypes = {
  INITIAL_AUTH_CHECK_SUCCESS: 'INITIAL_AUTH_CHECK_SUCCESS',

  SET_AUTH_REDIRECT_PATH: 'SET_AUTH_REDIRECT_PATH',
  AUTH_INIT: 'AUTH_INIT',

  AUTH_START: 'AUTH_START',
  
  LOGIN_WITH_EMAIL_AND_PASSWORD: 'LOGIN_WITH_EMAIL_AND_PASSWORD',

  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILED: 'AUTH_FAILED',
  
  LOGOUT: 'LOGOUT',
  LOGOUT_SUCCESS: 'LOGOUT_SUCCESS'
};

const internalError = 'Internal error occurred. Please check your internet connection and try again';

export const checkInitialAuthState = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    if (!getState().auth.initialCheckDone) {
      if (app.auth.user) {
        dispatch(initialAuthCheckSuccess(true, app.auth.user));
      } else {
        dispatch(initialAuthCheckSuccess(false, null));
      }
    }
  };
};

export const registerWithEmailAndPassword = (email: string, password: string) => {
  return async (dispatch: (...args: any[]) => void) => {
    try {
      dispatch(authStart());
      const loggedInUser = await registerWithEmailPassword(email, password);
      dispatch(loginSuccess(loggedInUser));
    } catch(error) {
      console.log('register failed', error);
      const errorMessage = error.message === 'name already in use' ? 'User with this e-mail already exists' : internalError;
      dispatch(loginFailed(errorMessage));
    }
  }
}

export const loginWithEmailAndPassword = (email: string, password: string) => {
  return async (dispatch: (...args: any[]) => void) => {
    try {
      dispatch(authStart());
      const loggedInUser = await loginWithEmailPassword(email, password);
      dispatch(loginSuccess(loggedInUser));
    } catch (error) {
      console.log('login failed', error);
      const errorMessage = error.message === 'invalid username/password' ? 'Please check your login and password and try again' : internalError;
      dispatch(loginFailed(errorMessage));
    }
  };
};

export const logout = () => {
  return async (dispatch: (...args: any[]) => void) => {
    try {
      if (hasLoggedInUser()) {
        await logoutCurrentUser();
      }
    } finally {
      dispatch(logoutSuccess());
    }
  };
};



export const setAuthRedirectPath = (path: string) => {
  return {
    type: AuthActionTypes.SET_AUTH_REDIRECT_PATH,
    path
  };
};

export const authInit = () => {
  return {
    type: AuthActionTypes.AUTH_INIT
  };
};

export const authStart = () => {
  return {
    type: AuthActionTypes.AUTH_START
  };
};

export const loginSuccess = (user: StitchUser) => {
  return {
    type: AuthActionTypes.AUTH_SUCCESS,
    user
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

export const initialAuthCheckSuccess = (isLoggedIn: boolean, user: StitchUser | null) => {
  return {
    type: AuthActionTypes.INITIAL_AUTH_CHECK_SUCCESS,
    isLoggedIn,
    user
  };
};
