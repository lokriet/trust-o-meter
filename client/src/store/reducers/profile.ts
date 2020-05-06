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
import { Profile } from '../model/profile';

 
export interface ProfileState {
  profile: Profile | null;
  error: string | null;
  loading: boolean;
}

const initialState: ProfileState = {
  profile: null,
  error: null,
  loading: false,
};

export const profileReducer = (
  state: ProfileState = initialState,
  action: any
): ProfileState => {
  switch (action.type) {
    case actionTypes.profile.SET_PROFILE:
      return {
        ...state,
        profile: action.profile,
      };
    case actionTypes.profile.PROFILE_OPERATION_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case actionTypes.profile.PROFILE_OPERATION_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        profile: action.profile,
      };
    case actionTypes.profile.PROFILE_OPERATION_FAILED:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    case actionTypes.profile.RESET_PROFILE_STORE:
      return initialState;
    default:
      return state;
  }
};
