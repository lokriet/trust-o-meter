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
import env from '../../secret/environment';
import { Contact } from '../model/contact';
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
      const response = await fetch(`${env.serverUrl}/contacts/search`, {
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

export const createContactRequest = (contactIdentificator: string, onOperationDone: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(`${env.serverUrl}/contacts/request`, {
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
        onOperationDone(true);
      } else if (response.status === 422) {
        dispatch(contactsOperationFailed(responseData.data[0].errorMessage));
        onOperationDone(false);
      } else {
        dispatch(
          contactsOperationFailed(
            response.status === 500
              ? 'Friend request failed. Please try again'
              : responseData.message
          )
        );
        onOperationDone(false);
      }
    } catch (error) {
      dispatch(
        contactsOperationFailed('Friend request failed. Please try again')
      );
      onOperationDone(false);
    }
  };
};

export const fetchUserContacts = (onOperationDone?: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(contactsFetchingStart());
      const token = getState().auth.token;
      const response = await fetch(`${env.serverUrl}/contacts`, {
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
    } finally {
      if (onOperationDone) {
        onOperationDone();
      }
    }
  };
};

export const approveContactRequest = (
  contactId: string,
  onOperationFailed: any
) => {
  return contactStatusChange({
    contactId,
    onOperationFailed,
    errorMessage:
      'Failed to approve friend request. Please check your internet connection and refresh the page before trying again.',
    operationUrl: `${env.serverUrl}/contacts/${contactId}/approve`,
    hasResponseData: true,
    successAction: contactApproveSuccess
  });
};

export const rejectContactRequest = (
  contactId: string,
  onOperationFailed: any
) => {
  return contactStatusChange({
    contactId,
    onOperationFailed,
    errorMessage:
      'Failed to reject friend request. Please check your internet connection and refresh the page before trying again.',
    operationUrl: `${env.serverUrl}/contacts/${contactId}/reject`,
    hasResponseData: false,
    successAction: contactRejectSuccess
  });
};

export const withdrawContactRequest = (
  contactId: string,
  onOperationFailed: any
) => {
  return contactStatusChange({
    contactId,
    onOperationFailed,
    errorMessage:
      'Failed to withdraw friend request. Please check your internet connection and refresh the page before trying again.',
    operationUrl: `${env.serverUrl}/contacts/${contactId}/withdraw`,
    hasResponseData: false,
    successAction: requestWithdrawSuccess
  });
};

export const confirmSeenRejectedRequest = (
  contactId: string,
  onOperationFailed: any
) => {
  return contactStatusChange({
    contactId,
    onOperationFailed,
    errorMessage:
      'Operation failed. Please check your internet connection and refresh the page before trying again.',
    operationUrl: `${env.serverUrl}/contacts/${contactId}/seenRequestReject`,
    hasResponseData: false,
    successAction: confirmSeenRejectedRequestSuccess
  });
};

export const deleteContact = (
  contactId: string,
  onOperationFailed: any
) => {
  return contactStatusChange({
    contactId,
    onOperationFailed,
    errorMessage:
      'Failed to delete contact. Please check your internet connection and refresh the page before trying again.',
    operationUrl: `${env.serverUrl}/contacts/${contactId}/delete`,
    hasResponseData: false,
    successAction: contactDeleteSuccess
  });
};

export const confirmSeenDeletedContact = (
  contactId: string,
  onOperationFailed: any
) => {
  return contactStatusChange({
    contactId,
    onOperationFailed,
    errorMessage:
      'Operation failed. Please check your internet connection and refresh the page before trying again.',
    operationUrl: `${env.serverUrl}/contacts/${contactId}/seenContactDelete`,
    hasResponseData: false,
    successAction: confirmSeenDeletedContactSuccess
  });
};

const contactStatusChange = (props: {
  contactId: string;
  errorMessage: string;
  operationUrl: string;
  successAction: any;
  hasResponseData: boolean;
  onOperationFailed: any;
}) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(props.operationUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        if (props.hasResponseData) {
          const responseData = await response.json();
          dispatch(props.successAction(responseData));
        } else {
          dispatch(props.successAction(props.contactId));
        }
      } else {
        dispatch(
          contactItemOperationFailed(
            props.contactId,
            props.errorMessage
          )
        );
        props.onOperationFailed();
      }
    } catch (error) {
      console.log(error);
      dispatch(
        contactItemOperationFailed(
          props.contactId,
          props.errorMessage
        )
      );
      props.onOperationFailed();
    }
  };
};

export const updateContactCustomName = (
  contactId: string,
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
    contactId,
    onOperationDone,
    operationUrl: `${env.serverUrl}/contacts/${contactId}/updateCustomName`,
    requestBody: {
      customName: newCustomName
    }
  });
};

export const increaseContactTrust = (
  contactId: string,
  onOperationDone: any
) => {
  return updateContact({
    contactId,
    onOperationDone,
    operationUrl: `${env.serverUrl}/contacts/${contactId}/updateTrust`,
    requestBody: { increase: true }
  });
};

export const decreaseContactTrust = (
  contactId: string,
  onOperationDone: any
) => {
  return updateContact({
    contactId,
    onOperationDone,
    operationUrl: `${env.serverUrl}/contacts/${contactId}/updateTrust`,
    requestBody: { increase: false }
  });
};

export const changeContactActionState = (
  contactId: string,
  statusId: string,
  actionId: string,
  actionDone: boolean,
  onOperationDone: any
) => {
  return updateContact({
    contactId,
    onOperationDone,
    operationUrl: `${env.serverUrl}/contacts/${contactId}/changeActionState`,
    requestBody: {
      statusId,
      actionId,
      actionDone
    }
  });
};

const updateContact = (props: {
  contactId: string;
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
        props.onOperationDone(true);
      } else {
        dispatch(
          contactItemOperationFailed(
            props.contactId,
            'Failed to update details. Please check your internet connection and refresh the page before trying again.'
          )
        );
        props.onOperationDone(false);
      }
    } catch (error) {
      console.log(error);
      dispatch(
        contactItemOperationFailed(
          props.contactId,
          'Failed to update details. Please check your internet connection and refresh the page before trying again.'
        )
      );
      props.onOperationDone(false);
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

const contactItemOperationFailed = (contactId: string, error: string) => {
  return {
    type: ContactsActionTypes.CONTACT_ITEM_OPERATION_FAILED,
    contactId,
    error
  };
};

const contactApproveSuccess = (contact: Contact) => {
  return {
    type: ContactsActionTypes.CONTACT_APPROVE_SUCCESS,
    contact
  };
};

const contactRejectSuccess = (contactId: string) => {
  return {
    type: ContactsActionTypes.CONTACT_REJECT_SUCCESS,
    contactId
  };
};

const requestWithdrawSuccess = (contactId: string) => {
  return {
    type: ContactsActionTypes.REQUEST_WITHDRAW_SUCCESS,
    contactId
  };
};

const confirmSeenRejectedRequestSuccess = (contactId: string) => {
  return {
    type: ContactsActionTypes.REJECTED_REQUEST_SEEN_SUCCESS,
    contactId
  };
};

const contactDeleteSuccess = (contactId: string) => {
  return {
    type: ContactsActionTypes.CONTACT_DELETE_SUCCESS,
    contactId
  };
};

const confirmSeenDeletedContactSuccess = (contactId: string) => {
  return {
    type: ContactsActionTypes.DELETED_CONTACT_SEEN_SUCCESS,
    contactId
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
