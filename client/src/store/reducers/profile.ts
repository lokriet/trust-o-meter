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
