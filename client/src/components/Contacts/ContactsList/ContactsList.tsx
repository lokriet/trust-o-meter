/**
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
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { PullDownContent, PullToRefresh, ReleaseContent } from 'react-js-pull-to-refresh';
import { connect, useDispatch } from 'react-redux';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { Contact, ContactStatus } from '../../../store/model/contact';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import Spinner from '../../UI/Spinner/Spinner';
import ConfirmedContact from './Contact/ConfirmedContact';
import DeletedContact from './Contact/DeletedContact';
import classes from './ContactList.module.scss';
import IncomingRequest from './IncomingRequest/IncomingRequest';
import OutgoingRequest from './OutgoingRequest/OutgoingRequest';


export enum ContactListType {
  ConfirmedContacts,
  PendingContacts
}

interface ContactsListProps {
  listType: ContactListType;

  confirmedContacts: Contact[];
  outgoingRequests: Contact[];
  incomingRequests: Contact[];
  loading: boolean;
  error: string | null;
  itemErrors: any;
}

const ContactsList = (props: ContactsListProps) => {
  const [pullUpdating, setPullUpdating] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.fetchUserContacts());
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    if (!pullUpdating) {
      setPullUpdating(true);
      const statusPromise = new Promise((resolve) => {
        dispatch(actions.fetchStatusList(resolve));
      });
      const contactsPromise = new Promise((resolve) => {
        dispatch(actions.fetchUserContacts(resolve));
      });

      return Promise.all([statusPromise, contactsPromise]).then(() => {
        setPullUpdating(false);
      });
    } else {
      return new Promise<any>((resolve) => resolve());
    }
  }, [dispatch, pullUpdating]);

  let contactsCount = 0;
  if (props.listType === ContactListType.ConfirmedContacts) {
    contactsCount = props.confirmedContacts.length;
  } else if (props.listType === ContactListType.PendingContacts) {
    contactsCount += props.incomingRequests.length;
    contactsCount += props.outgoingRequests.length;
  }

  let view: JSX.Element;
  if (props.loading && !pullUpdating) {
    view = <Spinner />;
  } else {
    view = (
      <PullToRefresh
        pullDownContent={<PullDownContent />}
        releaseContent={<ReleaseContent />}
        refreshContent={<Spinner />}
        pullDownThreshold={100}
        onRefresh={handleRefresh}
        triggerHeight={50}
        backgroundColor="#9ddcdc"
        startInvisible={true}
      >
        <div className={classes.List}>
          {props.error ? (
            <Error>
              Loading friends list failed. Please check your internet connection
              and try again.
            </Error>
          ) : null}
          {props.listType === ContactListType.PendingContacts ? (
            <>
              {props.incomingRequests.map((incomingRequest: Contact) => (
                <IncomingRequest
                  key={incomingRequest.contactProfile.identificator}
                  contact={incomingRequest}
                  error={props.itemErrors[incomingRequest._id]}
                />
              ))}
              {props.outgoingRequests.map((outgoingRequest: Contact) => (
                <OutgoingRequest
                  key={outgoingRequest.contactProfile.identificator}
                  contact={outgoingRequest}
                  error={props.itemErrors[outgoingRequest._id]}
                />
              ))}
            </>
          ) : null}
          {props.listType === ContactListType.ConfirmedContacts ? (
            <>
              {props.confirmedContacts.map((contact: Contact) =>
                contact.status === ContactStatus.Connected ? (
                  <ConfirmedContact
                    key={contact.contactProfile.identificator}
                    contact={contact}
                    error={props.itemErrors[contact._id]}
                  />
                ) : (
                  <DeletedContact
                    key={contact.contactProfile.identificator}
                    contact={contact}
                    error={props.itemErrors[contact._id]}
                  />
                )
              )}
              {contactsCount === 0 ? (<div>No contacts found</div>) : null}
            </>
          ) : null}
        </div>
      </PullToRefresh>
    );
  }
  return view;
};

ContactsList.propTypes = {
  listType: PropTypes.number.isRequired
};

const mapStateToProps = (state: State): Partial<ContactsListProps> => {
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
