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
        dispatch(contactsSearchFailed(responseData[0].errorMessage));
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
        body: JSON.stringify({identificator: contactIdentificator})
      });

      const responseData = await response.json();
      if (response.status === 200) {
        dispatch(contactRequestSuccess(responseData));
      } else if (response.status === 422) {
        dispatch(contactsOperationFailed(responseData[0].errorMessage));
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
        dispatch(
          contactsFetchingSuccess(responseData)
        );
      } else {
        contactsFetchingFailed('Friend request failed. Please try again');
      }
    } catch (error) {
      dispatch(
        contactsFetchingFailed('Friend request failed. Please try again')
      );
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

export const resetContactsStore = () => {
  return {
    type: ContactsActionTypes.RESET_CONTACTS_STORE
  };
};
