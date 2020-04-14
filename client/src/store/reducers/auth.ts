import { StitchUser } from 'mongodb-stitch-browser-sdk';

import * as actionTypes from '../actions/actionTypes';

export interface AuthState {
  isLoggedIn: boolean;
  currentUser: StitchUser | null;
  error: string | null;
  initialCheckDone: boolean;
  redirectPath: string;
  loading: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  currentUser: null,
  initialCheckDone: false,
  error: null,
  redirectPath: '/',
  loading: false,
};

export const authReducer = (
  state: AuthState = initialState,
  action: any
): AuthState => {
  switch (action.type) {
    case actionTypes.auth.INITIAL_AUTH_CHECK_SUCCESS:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        currentUser: action.user,
        initialCheckDone: true,
        error: null,
      };

    case actionTypes.auth.SET_AUTH_REDIRECT_PATH:
      return {
        ...state,
        redirectPath: action.path,
      };

    case actionTypes.auth.AUTH_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        currentUser: action.user,
        error: null,
        loading: false,
      };

    case actionTypes.auth.AUTH_FAILED:
      return {
        ...state,
        isLoggedIn: false,
        currentUser: null,
        error: action.error,
        loading: false,
      };

    case actionTypes.auth.LOGOUT_SUCCESS:
      return {
        ...state,
        isLoggedIn: false,
        currentUser: null,
        error: null,
        loading: false,
      };

    default:
      return state;
  }
};
