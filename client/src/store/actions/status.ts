import { Status } from '../model/status';
import { State } from '../reducers/state';

export const StatusActionTypes = {
  FETCH_STATUS_LIST_START: 'FETCH_STATUS_LIST_START',
  FETCH_STATUS_LIST_SUCCESS: 'FETCH_STATUS_LIST_SUCCESS',
  FETCH_STATUS_LIST_FAILED: 'FETCH_STATUS_LIST_FAILED',

  CREATE_STATUS_SUCCESS: 'CREATE_STATUS_SUCCESS',
  CREATE_STATUS_FAILED: 'CREATE_STATUS_FAILED',
  UPDATE_STATUS_SUCCESS: 'UPDATE_STATUS_SUCCESS',
  UPDATE_STATUS_FAILED: 'UPDATE_STATUS_FAILED',
  DELETE_STATUS_SUCCESS: 'DELETE_STATUS_SUCCESS',

  CREATE_ACTION_FAILED: 'CREATE_ACTION_FAILED',
  UPDATE_ACTION_FAILED: 'UPDATE_ACTION_FAILED',

  RESET_STATUS_STORE: 'RESET_STATUS_STORE'
};

export const fetchStatusList = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    const errorMessage =
      'Status list fetching failed. Please check your internet connection and reload the page';
    try {
      dispatch(fetchStatusListStart());
      const token = getState().auth.token;
      const response = await fetch('http://localhost:3001/status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const responseData = await response.json();

      if (response.status === 200) {
        dispatch(fetchStatusListSuccess(responseData));
      } else {
        dispatch(fetchStatusListFailed(errorMessage));
      }
    } catch (error) {
      console.log(error);
      dispatch(fetchStatusListFailed(errorMessage));
    }
  };
};


export const createStatus = (status: {name: string, minTrust: number}, onOperationDone: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    const defaultErrorMessage =
      'Adding status failed. Please check your internet connection and try again';
    try {
      const token = getState().auth.token;
      const response = await fetch('http://localhost:3001/status', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(status)
      });
      const responseData = await response.json();

      if (response.status === 201) {
        dispatch(createStatusSuccess(responseData));
        onOperationDone(true);
      } else {
        let errorMessage = defaultErrorMessage;
        if (response.status === 422) {
          errorMessage = responseData.data[0].errorMessage;
        }
        dispatch(createStatusFailed(errorMessage));
        onOperationDone(false);
      }
    } catch (error) {
      console.log(error);
      dispatch(createStatusFailed(defaultErrorMessage));
      onOperationDone(false);
    }
  };
};

export const updateStatus = (statusId: string, update: {name?: string, minTrust?: number}, onOperationDone: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    const defaultErrorMessage =
      'Status update failed. Please check your internet connection and try again';
    try {
      const token = getState().auth.token;
      const response = await fetch(`http://localhost:3001/status/${statusId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(update)
      });
      const responseData = await response.json();

      if (response.status === 200) {
        dispatch(updateStatusSuccess(responseData));
      } else {
        let errorMessage = defaultErrorMessage;
        if (response.status === 422) {
          errorMessage = responseData.data[0].errorMessage;
        }
        dispatch(updateStatusFailed(statusId, errorMessage));
      }
    } catch (error) {
      console.log(error);
      dispatch(updateStatusFailed(statusId, defaultErrorMessage));
    } finally {
      onOperationDone();
    }
  };
};

export const deleteStatus = (statusId: string, onOperationFailed: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    const defaultErrorMessage =
      'Deleting status failed. Please check your internet connection and try again';
    try {
      const token = getState().auth.token;
      const response = await fetch(`http://localhost:3001/status/${statusId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        dispatch(deleteStatusSuccess(statusId));
      } else {
        dispatch(updateStatusFailed(statusId, defaultErrorMessage));
        onOperationFailed();
      }
    } catch (error) {
      console.log(error);
      dispatch(updateStatusFailed(statusId, defaultErrorMessage));
      onOperationFailed();
    }
  };
};

export const createAction = (statusId: string, actionName: string, onOperationDone: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    const defaultErrorMessage =
      'Adding action failed. Please check your internet connection and try again';
    try {
      const token = getState().auth.token;
      const response = await fetch(`http://localhost:3001/status/${statusId}/actions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: actionName})
      });

      const responseData = await response.json();
      if (response.status === 201) {
        dispatch(updateStatusSuccess(responseData));
        onOperationDone(true);
      } else {
        let errorMessage = defaultErrorMessage;
        if (response.status === 422) {
          errorMessage = responseData.data[0].errorMessage;
        }
        dispatch(createActionFailed(statusId, errorMessage));
        onOperationDone(false);
      }
    } catch (error) {
      console.log(error);
      dispatch(createActionFailed(statusId, defaultErrorMessage));
      onOperationDone(false);
    }
  };
};

export const updateAction = (statusId: string, actionId: string, actionName: string, onOperationDone: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    const defaultErrorMessage =
      'Action update failed. Please check your internet connection and try again';
    try {
      const token = getState().auth.token;
      const response = await fetch(`http://localhost:3001/status/${statusId}/actions/${actionId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: actionName})
      });

      const responseData = await response.json();
      if (response.status === 200) {
        dispatch(updateStatusSuccess(responseData));
      } else {
        let errorMessage = defaultErrorMessage;
        if (response.status === 422) {
          errorMessage = responseData.data[0].errorMessage;
        }
        dispatch(updateActionFailed(statusId, actionId, errorMessage));
      }
    } catch (error) {
      console.log(error);
      dispatch(updateActionFailed(statusId, actionId, defaultErrorMessage));
    } finally {
      onOperationDone();
    }
  };
};

export const deleteAction = (statusId: string, actionId: string, onOperationFailed: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    const defaultErrorMessage =
      'Deleting action failed. Please check your internet connection and try again';
    try {
      const token = getState().auth.token;
      const response = await fetch(`http://localhost:3001/status/${statusId}/actions/${actionId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const responseData = await response.json();
      if (response.status === 200) {
        dispatch(updateStatusSuccess(responseData));
      } else {
        dispatch(updateActionFailed(statusId, actionId, defaultErrorMessage));
        onOperationFailed();
      }
    } catch (error) {
      console.log(error);
      dispatch(updateActionFailed(statusId, actionId, defaultErrorMessage));
      onOperationFailed();
    }
  };
};

const fetchStatusListStart = () => {
  return {
    type: StatusActionTypes.FETCH_STATUS_LIST_START
  }
};

const fetchStatusListFailed = (error: string) => {
  return {
    type: StatusActionTypes.FETCH_STATUS_LIST_FAILED,
    error
  };
};

const fetchStatusListSuccess = (statusList: Status[]) => {
  return {
    type: StatusActionTypes.FETCH_STATUS_LIST_SUCCESS,
    statusList
  };
};

const createStatusFailed = (error: string) => {
  return {
    type: StatusActionTypes.CREATE_STATUS_FAILED,
    error
  };
};

const createStatusSuccess = (status: Status) => {
  return {
    type: StatusActionTypes.CREATE_STATUS_SUCCESS,
    status
  };
};

const updateStatusFailed = (statusId: string, error: string) => {
  return {
    type: StatusActionTypes.UPDATE_STATUS_FAILED,
    statusId,
    error
  };
};

const updateStatusSuccess = (status: Status) => {
  return {
    type: StatusActionTypes.UPDATE_STATUS_SUCCESS,
    status
  };
};

const deleteStatusSuccess = (statusId: string) => {
  return {
    type: StatusActionTypes.DELETE_STATUS_SUCCESS,
    statusId
  };
};

const createActionFailed = (statusId: string, error: string) => {
  return {
    type: StatusActionTypes.CREATE_ACTION_FAILED,
    statusId,
    error
  };
};

const updateActionFailed = (statusId: string, actionId: string, error: string) => {
  return {
    type: StatusActionTypes.UPDATE_ACTION_FAILED,
    statusId,
    actionId,
    error
  };
};