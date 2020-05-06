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
import * as actionTypes from '../actions/actionTypes';

 
export interface AuthState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  token: string | null;
  waitingForEmailConfirmation: boolean;
  error: string | null;
  initialCheckDone: boolean;
  redirectPath: string;
  loading: boolean;

  passwordReset: boolean;
  resetPasswordEmailSent: boolean;
  activationEmailSent: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  isAdmin: false,
  token: null,
  waitingForEmailConfirmation: false,
  initialCheckDone: false,
  error: null,
  redirectPath: '/',
  loading: false,

  passwordReset: false,
  resetPasswordEmailSent: false,
  activationEmailSent: false
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
        error: null,
        passwordReset: false,
        resetPasswordEmailSent: false,
        activationEmailSent: false
      };
    case actionTypes.auth.INITIAL_AUTH_CHECK_SUCCESS:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        isAdmin: action.isAdmin,
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
        isAdmin: action.isAdmin,
        token: action.token,
        waitingForEmailConfirmation: action.waitingForEmailConfirmation,
        error: null,
        loading: false
      };

    case actionTypes.auth.AUTH_FAILED:
      return {
        ...state,
        isLoggedIn: false,
        isAdmin: false,
        token: null,
        waitingForEmailConfirmation: false,
        error: action.error,
        loading: false
      };

    case actionTypes.auth.LOGOUT_SUCCESS:
      return {
        ...state,
        isLoggedIn: false,
        isAdmin: false,
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
    case actionTypes.auth.RESEND_CONFIRMATION_EMAIL_SUCCESS:
      return {
        ...state,
        error: null,
        loading: false,
        activationEmailSent: true
      };
    case actionTypes.auth.REQUEST_PASSWORD_RESET_SUCCESS:
      return {
        ...state,
        error: null,
        loading: false,
        resetPasswordEmailSent: true
      };
    case actionTypes.auth.PASSWORD_RESET_SUCCESS:
      return {
        ...state,
        error: null,
        loading: false,
        passwordReset: true
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
