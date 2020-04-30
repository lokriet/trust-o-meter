import { State } from '../reducers/state';
import { Status } from '../model/status';

export const StatusActionTypes = {
  FETCH_STATUS_LIST_START: 'FETCH_STATUS_LIST_START',
  FETCH_STATUS_LIST_SUCCESS: 'FETCH_STATUS_LIST_SUCCESS',
  FETCH_STATUS_LIST_FAILED: 'FETCH_STATUS_LIST_FAILED',

  RESET_STATUS_STORE: 'RESET_STATUS_STORE'
};

export const getStatusList = () => {
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