import * as actionTypes from '../actions/actionTypes';

export interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  waitingForEmailConfirmation: boolean;
  error: string | null;
  initialCheckDone: boolean;
  redirectPath: string;
  loading: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  waitingForEmailConfirmation: false,
  initialCheckDone: false,
  error: null,
  redirectPath: '/',
  loading: false
};

export const authReducer = (
  state: AuthState = initialState,
  action: any
): AuthState => {
  switch (action.type) {
    case actionTypes.auth.AUTH_INIT:
      return {
        ...state,
        loading: false,
        error: null
      };
    case actionTypes.auth.INITIAL_AUTH_CHECK_SUCCESS:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        token: action.token,
        waitingForEmailConfirmation: action.waitingForEmailConfirmation,
        initialCheckDone: true,
        error: null
      };

    case actionTypes.auth.SET_AUTH_REDIRECT_PATH:
      return {
        ...state,
        redirectPath: action.path
      };

    case actionTypes.auth.AUTH_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        token: action.token,
        waitingForEmailConfirmation: action.waitingForEmailConfirmation,
        error: null,
        loading: false
      };

    case actionTypes.auth.AUTH_FAILED:
      return {
        ...state,
        isLoggedIn: false,
        token: null,
        waitingForEmailConfirmation: false,
        error: action.error,
        loading: false
      };

    case actionTypes.auth.LOGOUT_SUCCESS:
      return {
        ...state,
        isLoggedIn: false,
        token: null,
        waitingForEmailConfirmation: false,
        error: null,
        loading: false
      };

    case actionTypes.auth.AUTH_OPERATION_START:
      return {
        ...state,
        error: null,
        loading: true
      };
    case actionTypes.auth.RESEND_EMAIL_SUCCESS:
      return {
        ...state,
        error: null,
        loading: false
      };
    case actionTypes.auth.CONFIRM_EMAIL_SUCCESS:
      return {
        ...state,
        error: null,
        loading: false,
        waitingForEmailConfirmation: false
      };
    case actionTypes.auth.AUTH_OPERATION_FAILED:
      return {
        ...state,
        error: action.error,
        loading: false
      };

    default:
      return state;
  }
};
