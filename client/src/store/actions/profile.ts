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
import env from '../../secret/environment';
import { Profile } from '../model/profile';
import { State } from '../reducers/state';

 
export const ProfileActionTypes = {
  PROFILE_OPERATION_START: 'PROFILE_OPERATION_START',
  PROFILE_OPERATION_SUCCESS: 'PROFILE_OPERATION_SUCCESS',
  PROFILE_OPERATION_FAILED: 'PROFILE_OPERATION_FAILED',
  SET_PROFILE: 'SET_PROFILE',
  RESET_PROFILE_STORE: 'RESET_PROFILE_STORE'
};

export const updateProfile = (profileData: Partial<Profile>, onOperationDone: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(profileOperationStart());
      const token = getState().auth.token;
      const result = await fetch(`${env.serverUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (result.status === 200) {
        const resultData = await result.json();
        dispatch(profileOperationSuccess(resultData));
        onOperationDone(true);
      } else {
        dispatch(profileOperationFailed('Profile update failed'));
        onOperationDone(false);
      }
    } catch (error) {
      console.log('update profile failed', error);
      dispatch(profileOperationFailed('Profile update failed'));
      onOperationDone(false);
    }
  };
};

export const setProfile = (profile: Profile) => {
  return {
    type: ProfileActionTypes.SET_PROFILE,
    profile
  };
};

const profileOperationStart = () => {
  return {
    type: ProfileActionTypes.PROFILE_OPERATION_START
  };
};

const profileOperationFailed = (error: string) => {
  return {
    type: ProfileActionTypes.PROFILE_OPERATION_FAILED,
    error
  };
};

const profileOperationSuccess = (profile: Profile) => {
  return {
    type: ProfileActionTypes.PROFILE_OPERATION_SUCCESS,
    profile
  };
};

export const resetProfileStore = () => {
  return {
    type: ProfileActionTypes.RESET_PROFILE_STORE
  };
};
