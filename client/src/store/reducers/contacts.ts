import * as actionTypes from '../actions/actionTypes';
import { Profile } from '../model/profile';

export interface ContactsState {
  contacts: Partial<Profile>[];
  error: string | null;
  loading: boolean;
  contactOperationFinished: boolean;
}

const initialState: ContactsState = {
  contacts: [],
  error: null,
  loading: false,
  contactOperationFinished: false
};

export const contactsReducer = (
  state: ContactsState = initialState,
  action
): ContactsState => {
  switch (action.type) {
    case actionTypes.contacts.CONTACTS_FETCHING_START:
      return contactsFetchingStart(state, action);
    case actionTypes.contacts.CONTACTS_FETCHING_SUCCESS:
      return contactsFetchingSuccess(state, action);
    case actionTypes.contacts.CONTACTS_FETCHING_FAILED:
      return contactsFetchingFailed(state, action);
    case actionTypes.contacts.CONTACTS_OPERATION_RESET:
      return contactsOperationReset(state, action);
    case actionTypes.contacts.CONTACTS_OPERATION_SUCCESS:
      return contactsOperationSuccess(state, action);
    case actionTypes.contacts.CONTACTS_OPERATION_FAILED:
      return contactsOperationFailed(state, action);
    case actionTypes.contacts.RESET_CONTACTS_STORE:
      return initialState;
    default:
      return state;
  }
};

const contactsFetchingStart = (state: ContactsState, action) => {
  return {
    ...state,
    loading: true,
    error: null
  };
};

const contactsFetchingSuccess = (state: ContactsState, action) => {
  return {
    ...state,
    contacts: action.contacts,
    loading: false,
    error: null
  };
};

const contactsFetchingFailed = (state: ContactsState, action) => {
  return {
    ...state,
    loading: false,
    error: action.error
  };
};

const contactsOperationReset = (state: ContactsState, action) => {
  return {
    ...state,
    contactOperationFinished: false,
    error: null
  };
};

const contactsOperationSuccess = (state: ContactsState, action) => {
  return {
    ...state,
    contactOperationFinished: true,
    error: null
  };
};

const contactsOperationFailed = (state: ContactsState, action) => {
  return {
    ...state,
    contactOperationFinished: false,
    error: action.error
  };
};
