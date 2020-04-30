import { Contact, ContactUpdate } from '../model/contact';
import { Profile } from '../model/profile';
import { State } from '../reducers/state';

export const ContactsActionTypes = {
  CONTACTS_FETCHING_START: 'CONTACTS_FETCHING_START',
  CONTACTS_FETCHING_SUCCESS: 'CONTACTS_FETCHING_SUCCESS',
  CONTACTS_FETCHING_FAILED: 'CONTACTS_FETCHING_FAILED',

  CONTACTS_SEARCH_START: 'CONTACTS_SEARCH_START',
  CONTACTS_SEARCH_SUCCESS: 'CONTACTS_SEARCH_SUCCESS',
  CONTACTS_SEARCH_FAILED: 'CONTACTS_SEARCH_FAILED',

  CONTACTS_OPERATION_RESET: 'CONTACTS_OPERATION_RESET',
  CONTACT_REQUEST_SUCCESS: 'CONTACT_REQUEST_SUCCESS',
  CONTACTS_OPERATION_FAILED: 'CONTACTS_OPERATION_FAILED',

  CONTACT_ITEM_OPERATION_FAILED: 'CONTACT_ITEM_OPERATION_FAILED',
  CONTACT_APPROVE_SUCCESS: 'CONTACT_APPROVE_SUCCESS',
  CONTACT_REJECT_SUCCESS: 'CONTACT_REJECT_SUCCESS',
  REQUEST_WITHDRAW_SUCCESS: 'REQUEST_WITHDRAW_SUCCESS',
  REJECTED_REQUEST_SEEN_SUCCESS: 'REJECTED_REQUEST_SEEN_SUCCESS',
  CONTACT_DELETE_SUCCESS: 'CONTACT_DELETE_SUCCESS',
  DELETED_CONTACT_SEEN_SUCCESS: 'DELETED_CONTACT_SEEN_SUCCESS',
  CONTACT_UPDATE_SUCCESS: 'CONTACT_UPDATE_SUCCESS',

  RESET_CONTACTS_STORE: 'RESET_CONTACTS_STORE'
};

export const searchContacts = (searchString: string) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(contactsSearchStart());
      const token = getState().auth.token;
      const response = await fetch('http://localhost:3001/contacts/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ searchString })
      });
      const responseData = await response.json();

      if (response.status === 200) {
        dispatch(contactsSearchSuccess(responseData));
      } else if (response.status === 422) {
        dispatch(contactsSearchFailed(responseData.data[0].errorMessage));
      } else {
        console.log('dispatching error');
        dispatch(
          contactsSearchFailed(
            response.status === 500
              ? 'Contacts search failed. Please try again'
              : responseData.message
          )
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(
        contactsSearchFailed('Contacts search failed. Please try again')
      );
    }
  };
};

export const createContactRequest = (contactIdentificator: string) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const token = getState().auth.token;
      const response = await fetch('http://localhost:3001/contacts/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ identificator: contactIdentificator })
      });

      const responseData = await response.json();
      if (response.status === 200) {
        dispatch(contactRequestSuccess(responseData));
      } else if (response.status === 422) {
        dispatch(contactsOperationFailed(responseData.data[0].errorMessage));
      } else {
        dispatch(
          contactsOperationFailed(
            response.status === 500
              ? 'Friend request failed. Please try again'
              : responseData.message
          )
        );
      }
    } catch (error) {
      dispatch(
        contactsOperationFailed('Friend request failed. Please try again')
      );
    }
  };
};

export const fetchUserContacts = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(contactsFetchingStart());
      const token = getState().auth.token;
      const response = await fetch('http://localhost:3001/contacts', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const responseData = await response.json();
      if (response.status === 200) {
        dispatch(contactsFetchingSuccess(responseData));
      } else {
        dispatch(
          contactsFetchingFailed('Friend request failed. Please try again')
        );
      }
    } catch (error) {
      dispatch(
        contactsFetchingFailed('Friend request failed. Please try again')
      );
    }
  };
};

export const approveContactRequest = (
  contactIdentificator: string,
  onOperationDone: any
) => {
  return contactStatusChange({
    contactIdentificator,
    onOperationDone,
    errorMessage:
      'Failed to approve friend request. Please check your internet connection and refresh the page before trying again.',
    operationUrl: 'http://localhost:3001/contacts/approve',
    hasResponseData: true,
    successAction: contactApproveSuccess
  });
};

export const rejectContactRequest = (
  contactIdentificator: string,
  onOperationDone: any
) => {
  return contactStatusChange({
    contactIdentificator,
    onOperationDone,
    errorMessage:
      'Failed to reject friend request. Please check your internet connection and refresh the page before trying again.',
    operationUrl: 'http://localhost:3001/contacts/reject',
    hasResponseData: false,
    successAction: contactRejectSuccess
  });
};

export const withdrawContactRequest = (
  contactIdentificator: string,
  onOperationDone: any
) => {
  return contactStatusChange({
    contactIdentificator,
    onOperationDone,
    errorMessage:
      'Failed to withdraw friend request. Please check your internet connection and refresh the page before trying again.',
    operationUrl: 'http://localhost:3001/contacts/withdraw',
    hasResponseData: false,
    successAction: requestWithdrawSuccess
  });
};

export const confirmSeenRejectedRequest = (
  contactIdentificator: string,
  onOperationDone: any
) => {
  return contactStatusChange({
    contactIdentificator,
    onOperationDone,
    errorMessage:
      'Operation failed. Please check your internet connection and refresh the page before trying again.',
    operationUrl: 'http://localhost:3001/contacts/seenRequestReject',
    hasResponseData: false,
    successAction: confirmSeenRejectedRequestSuccess
  });
};

export const deleteContact = (
  contactIdentificator: string,
  onOperationDone: any
) => {
  return contactStatusChange({
    contactIdentificator,
    onOperationDone,
    errorMessage:
      'Failed to delete contact. Please check your internet connection and refresh the page before trying again.',
    operationUrl: 'http://localhost:3001/contacts/delete',
    hasResponseData: false,
    successAction: contactDeleteSuccess
  });
};

export const confirmSeenDeletedContact = (
  contactIdentificator: string,
  onOperationDone: any
) => {
  return contactStatusChange({
    contactIdentificator,
    onOperationDone,
    errorMessage:
      'Operation failed. Please check your internet connection and refresh the page before trying again.',
    operationUrl: 'http://localhost:3001/contacts/seenContactDelete',
    hasResponseData: false,
    successAction: confirmSeenDeletedContactSuccess
  });
};

const contactStatusChange = (props: {
  contactIdentificator: string;
  errorMessage: string;
  operationUrl: string;
  successAction: any;
  hasResponseData: boolean;
  onOperationDone: any;
}) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(props.operationUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identificator: props.contactIdentificator
        })
      });
      if (response.status === 200) {
        if (props.hasResponseData) {
          const responseData = await response.json();
          dispatch(props.successAction(responseData));
        } else {
          dispatch(props.successAction(props.contactIdentificator));
        }
      } else {
        dispatch(
          contactItemOperationFailed(
            props.contactIdentificator,
            props.errorMessage
          )
        );
      }
    } catch (error) {
      console.log('error', error);
      dispatch(
        contactItemOperationFailed(
          props.contactIdentificator,
          props.errorMessage
        )
      );
    } finally {
      props.onOperationDone();
    }
  };
};

export const updateContactCustomName = (
  contactIdentificator: string,
  customName: string | null,
  onOperationDone: any
) => {
  let newCustomName = customName;
  if (newCustomName) {
    newCustomName = newCustomName.trim();
  }
  if (newCustomName === '') {
    newCustomName = null;
  }

  return updateContact({
    contactIdentificator,
    onOperationDone,
    operationUrl: 'http://localhost:3001/contacts/updateCustomName',
    requestBody: { identificator: contactIdentificator, customName: newCustomName }
  });
};

export const increaseContactTrust = (
  contactIdentificator: string,
  onOperationDone: any
) => {
  return updateContact({
    contactIdentificator,
    onOperationDone,
    operationUrl: 'http://localhost:3001/contacts/updateTrust',
    requestBody: { identificator: contactIdentificator, increase: true }
  });
};

export const decreaseContactTrust = (
  contactIdentificator: string,
  onOperationDone: any
) => {
  return updateContact({
    contactIdentificator,
    onOperationDone,
    operationUrl: 'http://localhost:3001/contacts/updateTrust',
    requestBody: { identificator: contactIdentificator, increase: false }
  });
};

const updateContact = (props: {
  contactIdentificator: string;
  operationUrl: string;
  requestBody: any;
  onOperationDone: any;
}) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(props.operationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(props.requestBody)
      });

      const responseData = await response.json();
      if (response.status === 200) {
        dispatch(contactUpdateSuccess(responseData));
      } else {
        dispatch(
          contactItemOperationFailed(
            props.contactIdentificator,
            'Failed to update details. Please check your internet connection and refresh the page before trying again.'
          )
        );
      }
    } catch (error) {
      console.log(error);
      dispatch(
        contactItemOperationFailed(
          props.contactIdentificator,
          'Failed to update details. Please check your internet connection and refresh the page before trying again.'
        )
      );
    } finally {
      props.onOperationDone();
    }
  };
};

const contactsFetchingStart = () => {
  return {
    type: ContactsActionTypes.CONTACTS_FETCHING_START
  };
};

const contactsFetchingSuccess = (contacts: Contact[]) => {
  return {
    type: ContactsActionTypes.CONTACTS_FETCHING_SUCCESS,
    contacts
  };
};

const contactsFetchingFailed = (error: string) => {
  return {
    type: ContactsActionTypes.CONTACTS_FETCHING_FAILED,
    error
  };
};

const contactsSearchStart = () => {
  return {
    type: ContactsActionTypes.CONTACTS_SEARCH_START
  };
};

const contactsSearchSuccess = (contacts: Profile[]) => {
  return {
    type: ContactsActionTypes.CONTACTS_SEARCH_SUCCESS,
    contacts
  };
};

const contactsSearchFailed = (error: string) => {
  return {
    type: ContactsActionTypes.CONTACTS_SEARCH_FAILED,
    error
  };
};

export const contactsOperationReset = () => {
  return {
    type: ContactsActionTypes.CONTACTS_OPERATION_RESET
  };
};

const contactRequestSuccess = (requestedContact: Contact) => {
  return {
    type: ContactsActionTypes.CONTACT_REQUEST_SUCCESS,
    requestedContact
  };
};

const contactsOperationFailed = (error: string) => {
  return {
    type: ContactsActionTypes.CONTACTS_OPERATION_FAILED,
    error
  };
};

const contactItemOperationFailed = (identificator: string, error: string) => {
  return {
    type: ContactsActionTypes.CONTACT_ITEM_OPERATION_FAILED,
    identificator,
    error
  };
};

const contactApproveSuccess = (contact: Contact) => {
  return {
    type: ContactsActionTypes.CONTACT_APPROVE_SUCCESS,
    contact
  };
};

const contactRejectSuccess = (identificator: string) => {
  return {
    type: ContactsActionTypes.CONTACT_REJECT_SUCCESS,
    identificator
  };
};

const requestWithdrawSuccess = (identificator: string) => {
  return {
    type: ContactsActionTypes.REQUEST_WITHDRAW_SUCCESS,
    identificator
  };
};

const confirmSeenRejectedRequestSuccess = (identificator: string) => {
  return {
    type: ContactsActionTypes.REJECTED_REQUEST_SEEN_SUCCESS,
    identificator
  };
};

const contactDeleteSuccess = (identificator: string) => {
  return {
    type: ContactsActionTypes.CONTACT_DELETE_SUCCESS,
    identificator
  };
};

const confirmSeenDeletedContactSuccess = (identificator: string) => {
  return {
    type: ContactsActionTypes.DELETED_CONTACT_SEEN_SUCCESS,
    identificator
  };
};

export const contactUpdateSuccess = (contact: Contact) => {
  return {
    type: ContactsActionTypes.CONTACT_UPDATE_SUCCESS,
    contact
  };
};

export const resetContactsStore = () => {
  return {
    type: ContactsActionTypes.RESET_CONTACTS_STORE
  };
};
