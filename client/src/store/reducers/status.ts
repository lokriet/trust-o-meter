import * as actionTypes from '../actions/actionTypes';
import { Status } from '../model/status';

export interface StatusState {
  statusList: Status[];
  error: string | null;
  loading: boolean;
  statusErrors: any;
  actionErrors: any;
}

const initialState: StatusState = {
  statusList: [],
  error: null,
  loading: false,
  statusErrors: {},
  actionErrors: {}
};

const statusComparator = (a: Status, b: Status): number => {
  return a.minTrust - b.minTrust;
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

    case actionTypes.status.CREATE_STATUS_SUCCESS:
      return createStatusSuccess(state, action);
    case actionTypes.status.CREATE_STATUS_FAILED:
      return createStatusFailed(state, action);
    case actionTypes.status.UPDATE_STATUS_SUCCESS:
      return updateStatusSuccess(state, action);
    case actionTypes.status.UPDATE_STATUS_FAILED:
      return updateStatusFailed(state, action);
    case actionTypes.status.DELETE_STATUS_SUCCESS:
      return deleteStatusSuccess(state, action);

    case actionTypes.status.CREATE_ACTION_FAILED:
      return createActionFailed(state, action);
    case actionTypes.status.UPDATE_ACTION_FAILED:
      return updateActionFailed(state, action);
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

const createStatusSuccess = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  const newStatusErrors = removeItemError(state.statusErrors, null);
  const newStatusList = state.statusList
    .concat(action.status)
    .sort(statusComparator);
  return {
    ...state,
    statusErrors: newStatusErrors,
    statusList: newStatusList
  };
};

const createStatusFailed = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  const newStatusErrors = { ...state.statusErrors };
  newStatusErrors.ADD = action.error;
  return {
    ...state,
    statusErrors: newStatusErrors
  };
};

const updateStatusSuccess = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  const updatedStatus: Status = action.status;
  const newStatusErrors = removeItemError(
    state.statusErrors,
    updatedStatus._id
  );
  const newActionErrors = removeItemError(
    state.actionErrors,
    updatedStatus._id
  );
  const newStatusList = state.statusList
    .map((item: Status) =>
      item._id === updatedStatus._id ? updatedStatus : item
    )
    .sort(statusComparator);
  return {
    ...state,
    statusErrors: newStatusErrors,
    actionErrors: newActionErrors,
    statusList: newStatusList
  };
};

const deleteStatusSuccess = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  const deletedStatusId: string = action.statusId;
  const newStatusErrors = removeItemError(state.statusErrors, deletedStatusId);
  const newStatusList = state.statusList.filter(
    (item: Status) => item._id !== deletedStatusId
  );
  return {
    ...state,
    statusErrors: newStatusErrors,
    statusList: newStatusList
  };
};

const updateStatusFailed = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  const newStatusErrors = { ...state.statusErrors };
  newStatusErrors[action.statusId] = action.error;
  return {
    ...state,
    statusErrors: newStatusErrors
  };
};

const createActionFailed = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  const newActionErrors = { ...state.actionErrors };
  if (!newActionErrors[action.statusId]) {
    newActionErrors[action.statusId] = {};
  }
  newActionErrors[action.statusId].ADD = action.error;
  return {
    ...state,
    actionErrors: newActionErrors
  };
};

const updateActionFailed = (
  state: StatusState = initialState,
  action: any
): StatusState => {
  const newActionErrors = { ...state.actionErrors };
  if (!newActionErrors.ADD) {
    newActionErrors.ADD = {};
  }
  newActionErrors[action.statusId][action.actionId] = action.error;
  return {
    ...state,
    actionErrors: newActionErrors
  };
};

const removeItemError = (errors: any, itemId: string | null) => {
  let newErrors;
  const errorId = itemId || 'ADD';
  if (errors[errorId] != null) {
    newErrors = { ...errors };
    delete newErrors[errorId];
    if (newErrors == null) {
      newErrors = {};
    }
  } else {
    newErrors = errors;
  }
  return newErrors;
};
