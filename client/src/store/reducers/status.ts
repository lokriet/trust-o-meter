import { Status } from '../model/status';
import * as actionTypes from '../actions/actionTypes';

export interface StatusState {
  statusList: Status[];
  error: string | null;
  loading: boolean;
}

const initialState: StatusState = {
  statusList: [],
  error: null,
  loading: false
};

export const statusReducer = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  switch (action.type) {
    case actionTypes.status.FETCH_STATUS_LIST_START:
      return fetchStatusListStart(state, action);
    case actionTypes.status.FETCH_STATUS_LIST_SUCCESS:
      return fetchStatusListSuccess(state, action);
    case actionTypes.status.FETCH_STATUS_LIST_FAILED:
      return fetchStatusListFailed(state, action);
    default:
      return state;
  }
};

const fetchStatusListStart = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  return {
    ...state,
    error: null,
    loading: true
  };
};

const fetchStatusListSuccess = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  return {
    ...state,
    error: null,
    loading: false,
    statusList: action.statusList
  };
};

const fetchStatusListFailed = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  return {
    ...state,
    error: action.error,
    loading: false
  };
};
