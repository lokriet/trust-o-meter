import { profiles } from '../../stitch/mongodb';
import { Profile } from '../model/profile';

export const ProfileActionTypes = {
  PROFILE_OPERATION_START: 'PROFILE_OPERATION_START',
  PROFILE_OPERATION_SUCCESS: 'PROFILE_OPERATION_SUCCESS',
  PROFILE_OPERATION_FAILED: 'PROFILE_OPERATION_FAILED',
  RESET_PROFILE_STORE: 'RESET_PROFILE_STORE'
};

export const fetchProfile = (ownerId: string) => {
  return async (dispatch: (...args: any[]) => void) => {
    try {
      dispatch(profileOperationStart());
      const profile = await profiles.findOne({ ownerId: ownerId });
      console.log(profile);
      dispatch(profileOperationSuccess(profile));
    } catch (error) {
      console.log('fetch profile failed', error);
      dispatch(profileOperationFailed());
    }
  };
};

export const createProfile = (profileData: Partial<Profile>) => {
  return async (dispatch: (...args: any[]) => void) => {
    try {
      dispatch(profileOperationStart());
      const result = await profiles.insertOne({ ...profileData });
      const profile = await profiles.findOne({ _id: result.insertedId });
      console.log('in actions', result, profile);
      dispatch(profileOperationSuccess(profile));
    } catch (error) {
      console.log('fetch profile failed', error);
      dispatch(profileOperationFailed());
    }
  };
};

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
      dispatch(profileOperationFailed());
    }
  };
}

const profileOperationStart = () => {
  return {
    type: ProfileActionTypes.PROFILE_OPERATION_START
  }
}

const profileOperationFailed = () => {
  return {
    type: ProfileActionTypes.PROFILE_OPERATION_FAILED
  };
};

const profileOperationSuccess = (profile) => {
  console.log('in actions dispatching success', profile);
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
