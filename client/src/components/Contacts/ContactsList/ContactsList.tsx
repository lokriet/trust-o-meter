import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { Contact, ContactStatus } from '../../../store/model/contact';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import Spinner from '../../UI/Spinner/Spinner';
import ConfirmedContact from './Contact/ConfirmedContact';
import DeletedContact from './Contact/DeletedContact';
import IncomingRequest from './IncomingRequest/IncomingRequest';
import OutgoingRequest from './OutgoingRequest/OutgoingRequest';

interface ContactsListProps {
  confirmedContacts: Contact[];
  outgoingRequests: Contact[];
  incomingRequests: Contact[];
  loading: boolean;
  error: string | null;
  itemErrors: any;
}

const ContactsList = (props: ContactsListProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.fetchUserContacts());
  }, [dispatch]);

  let view: JSX.Element;
  if (props.loading) {
    view = <Spinner />;
  } else if (props.error) {
    view = (
      <Error>
        Loading friends list failed. Please check your internet connection and
        reload the page.
      </Error>
    );
  } else {
    view = (
      <>
        {props.incomingRequests.map((incomingRequest: Contact) => (
          <IncomingRequest
            key={incomingRequest.contactProfile.identificator}
            contact={incomingRequest}
            error={props.itemErrors[incomingRequest.contactProfile.identificator]}
          />
        ))}
        {props.outgoingRequests.map((outgoingRequest: Contact) => (
          <OutgoingRequest
            key={outgoingRequest.contactProfile.identificator}
            contact={outgoingRequest}
            error={props.itemErrors[outgoingRequest.contactProfile.identificator]}
          />
        ))}
        {props.confirmedContacts.map((contact: Contact) =>
          contact.status === ContactStatus.ContactDeleted ? (
            <DeletedContact
              key={contact.contactProfile.identificator}
              contact={contact}
              error={props.itemErrors[contact.contactProfile.identificator]}
            />
          ) : (
            <ConfirmedContact
              key={contact.contactProfile.identificator}
              contact={contact}
              error={props.itemErrors[contact.contactProfile.identificator]}
            />
          )
        )}
      </>
    );
  }
  return view;
};

ContactsList.propTypes = {};

const mapStateToProps = (state: State): ContactsListProps => {
  return {
    confirmedContacts: state.contacts.confirmedContacts,
    outgoingRequests: state.contacts.outgoingRequests,
    incomingRequests: state.contacts.incomingRequests,
    loading: state.contacts.loading,
    error: state.contacts.error,
    itemErrors: state.contacts.itemErrors
  };
};

export default connect(mapStateToProps)(withAuthCheck(ContactsList));
