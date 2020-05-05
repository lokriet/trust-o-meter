import { Profile } from '../model/profile';
import { State } from '../reducers/state';
import env from '../../secret/environment';

export const ProfileActionTypes = {
  PROFILE_OPERATION_START: 'PROFILE_OPERATION_START',
  PROFILE_OPERATION_SUCCESS: 'PROFILE_OPERATION_SUCCESS',
  PROFILE_OPERATION_FAILED: 'PROFILE_OPERATION_FAILED',
  SET_PROFILE: 'SET_PROFILE',
  RESET_PROFILE_STORE: 'RESET_PROFILE_STORE'
};

export const setProfile = (profile: Profile) => {
  return {
    type: ProfileActionTypes.SET_PROFILE,
    profile
  };
};

export const updateProfile = (profileData: Partial<Profile>) => {
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
      } else {
        dispatch(profileOperationFailed('Profile update failed'));
      }
    } catch (error) {
      console.log('update profile failed', error);
      dispatch(profileOperationFailed('Profile update failed'));
    }
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
