import { profiles } from '../../stitch/mongodb';
import { Profile } from '../model/profile';
import { State } from '../reducers/state';

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
  }
}

export const updateProfile = (profileId: string, profileData: Partial<Profile>) => {
  return async (dispatch: (...args: any[]) => void) => {
    try {
      dispatch(profileOperationStart());
      const result = await profiles.updateOne({ _id: profileId }, profileData);
      const updatedProfile = await profiles.findOne({ _id: profileId });

      console.log('updated profile', result, updatedProfile);
      dispatch(profileOperationSuccess(updatedProfile));
    } catch (error) {
      console.log('update profile failed', error);
      dispatch(profileOperationFailed('Profile update failed'));
    }
  };
}

const profileOperationStart = () => {
  return {
    type: ProfileActionTypes.PROFILE_OPERATION_START
  }
}

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