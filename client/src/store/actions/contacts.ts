import { ContactSide } from '../../stitch/model/contactSide';
import { profiles, contacts } from '../../stitch/mongodb';
import { Profile } from '../model/profile';
import { State } from '../reducers/state';

export const ContactsActionTypes = {
  CONTACTS_FETCHING_START: 'CONTACTS_FETCHING_START',
  CONTACTS_FETCHING_SUCCESS: 'CONTACTS_FETCHING_SUCCESS',
  CONTACTS_FETCHING_FAILED: 'CONTACTS_FETCHING_FAILED',

  CONTACTS_OPERATION_RESET: 'CONTACTS_OPERATION_RESET',
  CONTACTS_OPERATION_SUCCESS: 'CONTACTS_OPERATION_SUCCESS',
  CONTACTS_OPERATION_FAILED: 'CONTACTS_OPERATION_FAILED',

  RESET_CONTACTS_STORE: 'RESET_CONTACTS_STORE'
};

export const searchContacts = (searchString: string) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      if (searchString !== '' && searchString != null) {
        dispatch(contactsFetchingStart());
        const profile = getState().profile.profile;
        if (!profile) {
          return;
        }
        let contacts = await profiles
          .find(
            {
              $or: [
                {
                  identificator: new RegExp('^' + searchString + '$', 'i')
                },
                { username: new RegExp(searchString, 'i') }
              ]
            },
            {
              projection: {
                ownerId: 0
              }
            }
          )
          .toArray();
        contacts = contacts.filter(item => item.identificator !== profile.identificator);
        dispatch(contactsFetchingSuccess(contacts));
      }
    } catch (error) {
      console.log(error);
      dispatch(
        contactsFetchingFailed('Contacts search failed. Please try again')
      );
    }
  };
};

export const createContactRequest = (contactSide: Partial<ContactSide>) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      await contacts.insertOne({...contactSide});
      dispatch(contactsOperationSuccess());
    } catch (error) {
      dispatch(contactsOperationFailed('Friend request failed. Please try again'));
    }
  }
}

const contactsFetchingStart = () => {
  return {
    type: ContactsActionTypes.CONTACTS_FETCHING_START
  };
};

const contactsFetchingSuccess = (contacts: Partial<Profile>[]) => {
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

export const contactsOperationReset = () => {
  return {
    type: ContactsActionTypes.CONTACTS_OPERATION_RESET
  };
};

const contactsOperationSuccess = () => {
  return {
    type: ContactsActionTypes.CONTACTS_OPERATION_SUCCESS
  };
};

const contactsOperationFailed = (error: string) => {
  return {
    type: ContactsActionTypes.CONTACTS_OPERATION_FAILED,
    error
  };
};
