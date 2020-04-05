import { StitchUser } from 'mongodb-stitch-browser-sdk';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import withAuthCheck from '../../../hoc/withAuthCheck';
import { ContactSideStatus } from '../../../stitch/model/contactSide';
import * as actions from '../../../store/actions';
import { Profile } from '../../../store/model/profile';
import { State } from '../../../store/reducers/state';
import { generateIdentificator } from '../../../util/util';
import { Error } from '../../UI/Error/Error';
import Spinner from '../../UI/Spinner/Spinner';

interface FindContactsProps {
  contacts: Partial<Profile>[];
  loading: boolean;
  addingSuccess: boolean;
  error: string | null;
  user: StitchUser | null;
}

const FindContacts = (props: FindContactsProps) => {
  const [searchString, setSearchString] = useState('');
  const [addRequestSent, setAddRequestSent] = useState(false);
  const [searchRequestSent, setSearchRequestSent] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.contactsOperationReset());
  }, [dispatch])

  const handleFindContacts = useCallback(() => {
    const trimmed = searchString.trim();
    if (trimmed !== '') {
      dispatch(actions.searchContacts(trimmed));
      setSearchRequestSent(true);
    }
  }, [dispatch, searchString]);

  const handleAddContact = useCallback(
    (contact: Partial<Profile>) => {
      if (props.user != null) {        
        const newContact = {
          otherSideIdentificator: contact.identificator,
          linkId: generateIdentificator(),
          ownerId: props.user.id,
          status: ContactSideStatus.WantToLink,
          // trustPoints: new BSON.Int32(0),
          trustPoints: 0,
          customName: ''
        };

        dispatch(actions.createContactRequest(newContact));
        setAddRequestSent(true);
      }
    },
    [],
  )

  let contactsList;
  if (props.loading) {
    contactsList = <Spinner />
  } else if (props.error) {
    contactsList = <Error>{props.error}</Error>
  } else if (searchRequestSent && props.contacts.length === 0) {
    contactsList = <div>No contacts found</div>
  } else {
    contactsList = (
      <>
      {props.contacts.map(contact => (
        <div key={contact._id}>
          <div>
            {contact.avatarUrl == null || contact.avatarUrl === '' ? null : <img src={contact.avatarUrl} />}
          </div>
          <div>{contact.username}</div>
          <button onClick={() => handleAddContact(contact)}>Add</button>
        </div>
      ))}
      </>
    );
  }
  return (addRequestSent && props.addingSuccess && !props.error) ? 
  <Redirect to="/" /> :
  (
    <div>
      <input
        value={searchString}
        onChange={event => setSearchString(event.target.value)}
      />
      <button onClick={handleFindContacts}>Find</button>

      {contactsList}
    </div>
  );
};

FindContacts.propTypes = {};

const mapStateToProps = (state: State) => {
  return {
    user: state.auth.currentUser,
    contacts: state.contacts.contacts,
    loading: state.contacts.loading,
    addingSuccess: state.contacts.contactOperationFinished,
    error: state.contacts.error
  };
};

export default connect(mapStateToProps)(withAuthCheck(FindContacts));
