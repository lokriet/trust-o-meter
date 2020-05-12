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

    case actionTypes.status.INIT_STATUS_OPERATION:
      return initStatusOperation(state, action);
    case actionTypes.status.INIT_ACTION_OPERATION:
      return initActionOperation(state, action);
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

    case actionTypes.status.APPLY_STATUS_UPDATE:
      return applyStatusUpdate(state, action);
    case actionTypes.status.APPLY_STATUS_DELETE:
      return applyStatusDelete(state, action);

    case actionTypes.status.RESET_STATUS_STORE:
      return initialState;
    default:
      return state;
  }
};

const fetchStatusListStart = (state: StatusState, action: any): StatusState => {
  return {
    ...state,
    error: null,
    loading: true
  };
};

const fetchStatusListSuccess = (
  state: StatusState,
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
  state: StatusState,
  action: any
): StatusState => {
  return {
    ...state,
    error: action.error,
    loading: false
  };
};

const initStatusOperation = (state: StatusState, action: any): StatusState => {
  const newStatusErrors = removeItemError(state.statusErrors, action.statusId);

  return {
    ...state,
    statusErrors: newStatusErrors
  };
};

const initActionOperation = (state: StatusState, action: any): StatusState => {
  const newActionErrors = removeActionItemError(
    state.actionErrors,
    action.statusId,
    action.actionId
  );
  return {
    ...state,
    actionErrors: newActionErrors
  };
};

const createStatusSuccess = (state: StatusState, action: any): StatusState => {
  const newStatusErrors = removeItemError(state.statusErrors, null);

  let newStatusList;
  if (state.statusList.find(status => status._id === action.status._id)) {
    newStatusList = state.statusList;
  } else {
    newStatusList = state.statusList
      .concat(action.status)
      .sort(statusComparator);
  }
  return {
    ...state,
    statusErrors: newStatusErrors,
    statusList: newStatusList
  };
};

const createStatusFailed = (state: StatusState, action: any): StatusState => {
  const newStatusErrors = { ...state.statusErrors };
  newStatusErrors.ADD = action.error;
  return {
    ...state,
    statusErrors: newStatusErrors
  };
};

const updateStatusSuccess = (state: StatusState, action: any): StatusState => {
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

const deleteStatusSuccess = (state: StatusState, action: any): StatusState => {
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

const updateStatusFailed = (state: StatusState, action: any): StatusState => {
  const newStatusErrors = { ...state.statusErrors };
  newStatusErrors[action.statusId] = action.error;
  return {
    ...state,
    statusErrors: newStatusErrors
  };
};

const createActionFailed = (state: StatusState, action: any): StatusState => {
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

const updateActionFailed = (state: StatusState, action: any): StatusState => {
  const newActionErrors = { ...state.actionErrors };
  if (!newActionErrors[action.statusId]) {
    newActionErrors[action.statusId] = {};
  }
  newActionErrors[action.statusId][action.actionId] = action.error;
  return {
    ...state,
    actionErrors: newActionErrors
  };
};

const applyStatusUpdate = (state: StatusState, action: any): StatusState => {
  const statusIndex = state.statusList.findIndex(
    (status) => status._id === action.updatedStatus._id
  );
  let newStatusList: Status[];
  if (statusIndex < 0) {
    newStatusList = state.statusList.concat(action.updatedStatus);
  } else {
    newStatusList = state.statusList.map((status) =>
      status._id === action.updatedStatus._id ? action.updatedStatus : status
    );
  }
  newStatusList.sort(statusComparator);

  return {
    ...state,
    statusList: newStatusList
  };
};

const applyStatusDelete = (state: StatusState, action: any): StatusState => {
  return {
    ...state,
    statusList: state.statusList.filter(
      (status) => status._id !== action.updatedStatusId
    )
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

const removeActionItemError = (
  errors: any,
  statusId: string,
  actionId: string | null
) => {
  let newErrors;
  const actionErrorId = actionId || 'ADD';
  if (errors[statusId] != null && errors[statusId][actionErrorId] != null) {
    newErrors = { ...errors };
    newErrors[statusId] = { ...errors[statusId] };
    delete newErrors[statusId][actionErrorId];
  } else {
    newErrors = errors;
  }

  return newErrors;
};
