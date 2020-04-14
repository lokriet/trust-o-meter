import { ContactSide, ContactSideStatus } from '../../stitch/model/contactSide';
import { contacts, profiles } from '../../stitch/mongodb';
import { Contact, ContactStatus } from '../model/contact';
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

  RESET_CONTACTS_STORE: 'RESET_CONTACTS_STORE',
};

export const searchContacts = (searchString: string) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      if (searchString !== '' && searchString != null) {
        dispatch(contactsSearchStart());
        const profile = getState().profile.profile;
        if (!profile) {
          return;
        }

        let contacts = await profiles
          .find(
            {
              $or: [
                {
                  identificator: new RegExp('^' + searchString + '$', 'i'),
                },
                { username: new RegExp(searchString, 'i') },
              ],
            },
            {
              projection: {
                ownerId: 0,
              },
            }
          )
          .toArray();

        const existingContactIdentificators = getState().contacts.confirmedContacts.map((item: Contact) => item.contactProfile.identificator);
        getState().contacts.incomingRequests.forEach((item: Contact) => existingContactIdentificators.push(item.contactProfile.identificator));
        getState().contacts.outgoingRequests.forEach((item: Contact) =>  existingContactIdentificators.push(item.contactProfile.identificator));

        contacts = contacts.filter(
          (item) => item.identificator !== profile.identificator && !existingContactIdentificators.includes(item.identificator)
        );
        dispatch(contactsSearchSuccess(contacts));
      }
    } catch (error) {
      console.log(error);
      dispatch(
        contactsSearchFailed('Contacts search failed. Please try again')
      );
    }
  };
};

export const createContactRequest = (contactSide: Partial<ContactSide>) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const dbContactSide = {...contactSide};
      delete dbContactSide.otherSideProfile;
      await contacts.insertOne({ ...dbContactSide });
      dispatch(contactRequestSuccess(contactSide));
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
      const profile = getState().profile.profile;
      const user = getState().auth.currentUser;
      if (!user || !profile) {
        return;
      }

      const contactSides: ContactSide[] = await contacts
        .aggregate([
          {
            $match: {
              $or: [
                {
                  ownerId: user.id,
                },
                {
                  otherSideIdentificator: profile.identificator,
                },
              ],
            },
          },

          {
            $lookup: {
              from: 'profiles',
              let: {
                profileId: '$item.otherSideProfileId',
              },
              pipeline: [
                {
                  $match: {
                    _id: 'profileId',
                  },
                },
                {
                  $project: {
                    ownerId: 0,
                  },
                },
              ],
              as: 'otherSideProfile',
            },
          },

          {
            $lookup: {
              from: 'profiles',
              let: {
                profileOwnerId: '$item.ownerId',
              },
              pipeline: [
                {
                  $match: {
                    ownerId: 'profileOwnerId',
                  },
                },
                {
                  $project: {
                    ownerId: 0,
                  },
                },
              ],
              as: 'ownerProfile',
            },
          },
        ])
        .toArray();

      const contactPairs: any = {};
      contactSides.forEach((contactSide: ContactSide) => {
        let contactPair = contactPairs[contactSide.linkId] || {};
        if (contactSide.ownerId === user.id) {
          contactPair.me = contactSide;
        } else {
          contactPair.them = contactSide;
        }
      });

      let incomingRequests: Contact[] = [];
      let outgoingRequests: Contact[] = [];
      let confirmedContacts: Contact[] = [];

      Object.keys(contactPairs).forEach((linkId) => {
        const contactPair: {
          me: ContactSide | undefined;
          them: ContactSide | undefined;
        } = contactPairs[linkId];
        if (
          !contactPair.me &&
          contactPair.them &&
          contactPair.them.status === ContactSideStatus.WantToLink
        ) {
          const contact = {
            status: ContactStatus.IncomingRequest,
            contactProfile: contactPair.them.ownerProfile[0],
            myCustomName: null,
            contactCustomName: contactPair.them.customName,
            myTrustPoints: 0,
            contactTrustPoints: 0,
          };
          incomingRequests.push(contact);
        } else if (
          !contactPair.them &&
          contactPair.me &&
          contactPair.me.status === ContactSideStatus.WantToLink
        ) {
          const contact = {
            status: ContactStatus.OutgoingRequest,
            contactProfile: contactPair.me.otherSideProfile[0],
            myCustomName: contactPair.me.customName,
            contactCustomName: null,
            myTrustPoints: 0,
            contactTrustPoints: 0,
          };
          outgoingRequests.push(contact);
        } else if (
          contactPair.me &&
          contactPair.them &&
          contactPair.me.status === ContactSideStatus.WantToLink &&
          contactPair.them.status === ContactSideStatus.WantToLink
        ) {
          const contact = {
            status: ContactStatus.Connected,
            contactProfile: contactPair.me.otherSideProfile[0],
            myCustomName: contactPair.me.customName,
            contactCustomName: contactPair.them.customName,
            myTrustPoints: contactPair.me.trustPoints || 0,
            contactTrustPoints: contactPair.them.trustPoints || 0,
          };
          confirmedContacts.push(contact);
        }
      });
      dispatch(contactsFetchingSuccess({confirmedContacts, incomingRequests, outgoingRequests}));
    } catch (error) {
      dispatch(
        contactsFetchingFailed('Friend request failed. Please try again')
      );
    }
  };
};

const contactsFetchingStart = () => {
  return {
    type: ContactsActionTypes.CONTACTS_FETCHING_START,
  };
};

const contactsFetchingSuccess = (params: {
  confirmedContacts: Contact[];
  incomingRequests: Contact[];
  outgoingRequests: Contact[];
}) => {
  return {
    type: ContactsActionTypes.CONTACTS_FETCHING_SUCCESS,
    confirmedContacts: params.confirmedContacts,
    incomingRequests: params.incomingRequests,
    outgoingRequests: params.outgoingRequests,
  };
};

const contactsFetchingFailed = (error: string) => {
  return {
    type: ContactsActionTypes.CONTACTS_FETCHING_FAILED,
    error,
  };
};

const contactsSearchStart = () => {
  return {
    type: ContactsActionTypes.CONTACTS_SEARCH_START,
  };
};

const contactsSearchSuccess = (contacts: Partial<Profile>[]) => {
  return {
    type: ContactsActionTypes.CONTACTS_SEARCH_SUCCESS,
    contacts,
  };
};

const contactsSearchFailed = (error: string) => {
  return {
    type: ContactsActionTypes.CONTACTS_SEARCH_FAILED,
    error,
  };
};

export const contactsOperationReset = () => {
  return {
    type: ContactsActionTypes.CONTACTS_OPERATION_RESET,
  };
};

const contactRequestSuccess = (contactSide) => {
  return {
    type: ContactsActionTypes.CONTACT_REQUEST_SUCCESS,
    contactSide
  };
};

const contactsOperationFailed = (error: string) => {
  return {
    type: ContactsActionTypes.CONTACTS_OPERATION_FAILED,
    error,
  };
};
