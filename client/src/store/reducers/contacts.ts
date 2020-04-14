import * as actionTypes from '../actions/actionTypes';
import { Contact, ContactStatus } from '../model/contact';
import { Profile } from '../model/profile';

export interface ContactsState {
  confirmedContacts: Contact[];
  incomingRequests: Contact[];
  outgoingRequests: Contact[];
  searchResult: Partial<Profile>[];
  error: string | null;
  loading: boolean;
  contactOperationFinished: boolean;
}

const initialState: ContactsState = {
  confirmedContacts: [],
  incomingRequests: [],
  outgoingRequests: [],
  searchResult: [],
  error: null,
  loading: false,
  contactOperationFinished: false,
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
    case actionTypes.contacts.CONTACTS_SEARCH_START:
      return contactsSearchStart(state, action);
    case actionTypes.contacts.CONTACTS_SEARCH_SUCCESS:
      return contactsSearchSuccess(state, action);
    case actionTypes.contacts.CONTACTS_SEARCH_FAILED:
      return contactsSearchFailed(state, action);
    case actionTypes.contacts.CONTACTS_OPERATION_RESET:
      return contactsOperationReset(state, action);
    case actionTypes.contacts.CONTACT_REQUEST_SUCCESS:
      return contactRequestSuccess(state, action);
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
    error: null,
  };
};

const contactsFetchingSuccess = (state: ContactsState, action) => {
  return {
    ...state,
    confirmedContacts: action.confirmedContacts,
    outgoingRequests: action.outgoingRequests,
    incomingRequests: action.incomingRequests,
    loading: false,
    error: null,
  };
};

const contactsFetchingFailed = (state: ContactsState, action) => {
  return {
    ...state,
    loading: false,
    error: action.error,
  };
};

const contactsSearchStart = (state: ContactsState, action) => {
  return {
    ...state,
    loading: true,
    error: null,
  };
};

const contactsSearchSuccess = (state: ContactsState, action) => {
  return {
    ...state,
    searchResult: action.contacts,
    loading: false,
    error: null,
  };
};

const contactsSearchFailed = (state: ContactsState, action) => {
  return {
    ...state,
    loading: false,
    error: action.error,
  };
};

const contactsOperationReset = (state: ContactsState, action) => {
  return {
    ...state,
    contactOperationFinished: false,
    error: null,
  };
};

// const contactsOperationSuccess = (state: ContactsState, action) => {
//   return {
//     ...state,
//     contactOperationFinished: true,
//     error: null
//   };
// };

const contactRequestSuccess = (state: ContactsState, action) => {
  const requestedContact = {
    status: ContactStatus.OutgoingRequest,
    contactProfile: action.contactSide.otherSideProfile,
    myCustomName: null,
    contactCustomName: null,
    myTrustPoints: 0,
    contactTrustPoints: 0,
  };

  return {
    ...state,
    contactOperationFinished: true,
    error: null,
    outgoingRequests: [...state.outgoingRequests, requestedContact],
  };
};

const contactsOperationFailed = (state: ContactsState, action) => {
  return {
    ...state,
    contactOperationFinished: false,
    error: action.error,
  };
};
