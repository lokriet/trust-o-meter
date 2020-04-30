import * as actionTypes from '../actions/actionTypes';
import { Contact, ContactStatus } from '../model/contact';
import { Profile } from '../model/profile';

export interface ContactsState {
  confirmedContacts: Contact[];
  incomingRequests: Contact[];
  outgoingRequests: Contact[];
  searchResult: Profile[];
  error: string | null;
  loading: boolean;
  contactOperationFinished: boolean;

  itemErrors: any;
}

const initialState: ContactsState = {
  confirmedContacts: [],
  incomingRequests: [],
  outgoingRequests: [],
  searchResult: [],
  error: null,
  loading: false,
  contactOperationFinished: false,

  itemErrors: {}
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

    case actionTypes.contacts.CONTACT_ITEM_OPERATION_FAILED:
      return contactItemOperationFailed(state, action);
    case actionTypes.contacts.CONTACT_APPROVE_SUCCESS:
      return contactApproveSuccess(state, action);
    case actionTypes.contacts.CONTACT_REJECT_SUCCESS:
      return contactRejectSuccess(state, action);
    case actionTypes.contacts.REQUEST_WITHDRAW_SUCCESS:
      return requestWithdrawSuccess(state, action);
    case actionTypes.contacts.REJECTED_REQUEST_SEEN_SUCCESS:
      return confirmSeenRejectedRequestSuccess(state, action);
    case actionTypes.contacts.CONTACT_DELETE_SUCCESS:
      return contactDeleteSuccess(state, action);
    case actionTypes.contacts.DELETED_CONTACT_SEEN_SUCCESS:
      return confirmSeenDeletedContact(state, action);
    case actionTypes.contacts.CONTACT_UPDATE_SUCCESS:
      return contactUpdateSuccess(state, action);

    case actionTypes.contacts.RESET_CONTACTS_STORE:
      return initialState;
    default:
      return state;
  }
};

const contactsFetchingStart = (state: ContactsState, action): ContactsState => {
  return {
    ...state,
    loading: true,
    error: null
  };
};

const contactsFetchingSuccess = (
  state: ContactsState,
  action
): ContactsState => {
  const newConfirmedContacts: Contact[] = [];
  const newOutgoingRequests: Contact[] = [];
  const newIncomingRequests: Contact[] = [];

  action.contacts.forEach((contact: Contact) => {
    switch (contact.status) {
      case ContactStatus.Connected:
      case ContactStatus.ContactDeleted:
        newConfirmedContacts.push(contact);
        break;
      case ContactStatus.OutgoingRequest:
      case ContactStatus.RequestDenied:
        newOutgoingRequests.push(contact);
        break;
      case ContactStatus.IncomingRequest:
        newIncomingRequests.push(contact);
    }
  });

  return {
    ...state,
    confirmedContacts: newConfirmedContacts,
    outgoingRequests: newOutgoingRequests,
    incomingRequests: newIncomingRequests,
    loading: false,
    error: null
  };
};

const contactsFetchingFailed = (
  state: ContactsState,
  action
): ContactsState => {
  return {
    ...state,
    loading: false,
    error: action.error
  };
};

const contactsSearchStart = (state: ContactsState, action): ContactsState => {
  return {
    ...state,
    loading: true,
    error: null
  };
};

const contactsSearchSuccess = (state: ContactsState, action): ContactsState => {
  return {
    ...state,
    searchResult: action.contacts,
    loading: false,
    error: null
  };
};

const contactsSearchFailed = (state: ContactsState, action): ContactsState => {
  return {
    ...state,
    loading: false,
    error: action.error
  };
};

const contactsOperationReset = (
  state: ContactsState,
  action
): ContactsState => {
  return {
    ...state,
    contactOperationFinished: false,
    error: null,
    loading: false,
    searchResult: []
  };
};

const contactRequestSuccess = (state: ContactsState, action): ContactsState => {
  return {
    ...state,
    contactOperationFinished: true,
    error: null,
    outgoingRequests: [...state.outgoingRequests, action.requestedContact]
  };
};

const contactsOperationFailed = (
  state: ContactsState,
  action
): ContactsState => {
  return {
    ...state,
    contactOperationFinished: false,
    error: action.error
  };
};

const contactItemOperationFailed = (
  state: ContactsState,
  action
): ContactsState => {
  return {
    ...state,
    itemErrors: { ...state.itemErrors, [action.identificator]: action.error }
  };
};

const contactApproveSuccess = (state: ContactsState, action): ContactsState => {
  const contact: Contact = action.contact;
  const identificator: string = contact.contactProfile.identificator;
  const newItemErrors = removeItemError(state.itemErrors, identificator);
  const newIncomingRequests = state.incomingRequests.filter(
    (item: Contact) => item.contactProfile.identificator !== identificator
  );
  const newConfirmedContacts = state.confirmedContacts.concat(contact);
  return {
    ...state,
    itemErrors: newItemErrors,
    incomingRequests: newIncomingRequests,
    confirmedContacts: newConfirmedContacts
  };
};

const contactRejectSuccess = (state: ContactsState, action): ContactsState => {
  const identificator: string = action.identificator;
  const newItemErrors = removeItemError(state.itemErrors, identificator);
  const newIncomingRequests = state.incomingRequests.filter(
    (item: Contact) => item.contactProfile.identificator !== identificator
  );
  return {
    ...state,
    itemErrors: newItemErrors,
    incomingRequests: newIncomingRequests
  };
};

const requestWithdrawSuccess = (state: ContactsState, action): ContactsState => {
  const identificator: string = action.identificator;
  const newItemErrors = removeItemError(state.itemErrors, identificator);
  const newOutgoingRequests = state.incomingRequests.filter(
    (item: Contact) => item.contactProfile.identificator !== identificator
  );
  return {
    ...state,
    itemErrors: newItemErrors,
    outgoingRequests: newOutgoingRequests
  };
};

const confirmSeenRejectedRequestSuccess = (state: ContactsState, action): ContactsState => {
  const identificator: string = action.identificator;
  const newItemErrors = removeItemError(state.itemErrors, identificator);
  const newOutgoingRequests = state.incomingRequests.filter(
    (item: Contact) => item.contactProfile.identificator !== identificator
  );
  return {
    ...state,
    itemErrors: newItemErrors,
    outgoingRequests: newOutgoingRequests
  };
};

const contactDeleteSuccess = (state: ContactsState, action): ContactsState => {
  const identificator: string = action.identificator;
  const newItemErrors = removeItemError(state.itemErrors, identificator);
  const newConfirmedContacts = state.incomingRequests.filter(
    (item: Contact) => item.contactProfile.identificator !== identificator
  );
  return {
    ...state,
    itemErrors: newItemErrors,
    confirmedContacts: newConfirmedContacts
  };
};

const confirmSeenDeletedContact = (state: ContactsState, action): ContactsState => {
  const identificator: string = action.identificator;
  const newItemErrors = removeItemError(state.itemErrors, identificator);
  const newConfirmedContacts = state.incomingRequests.filter(
    (item: Contact) => item.contactProfile.identificator !== identificator
  );
  return {
    ...state,
    itemErrors: newItemErrors,
    confirmedContacts: newConfirmedContacts
  };
};

const contactUpdateSuccess = (state: ContactsState, action): ContactsState => {
  const contact: Contact = action.contact;
  const identificator: string = contact.contactProfile.identificator;
  const newItemErrors = removeItemError(state.itemErrors, identificator);
  const newConfirmedContacts = state.confirmedContacts.map((item: Contact) => {
    if (item.contactProfile.identificator === identificator) {
      return contact;
    } else {
      return item;
    }
  })
  return {
    ...state,
    itemErrors: newItemErrors,
    confirmedContacts: newConfirmedContacts
  };
};

const removeItemError = (itemErrors: any, identificator: string): any => {
  let newErrors: any;
  if (itemErrors[identificator] != null) {
    newErrors = { ...itemErrors };
    delete newErrors[identificator];
    if (newErrors == null) {
      newErrors = {};
    }
  } else {
    newErrors = itemErrors;
  }
  return newErrors;
};
