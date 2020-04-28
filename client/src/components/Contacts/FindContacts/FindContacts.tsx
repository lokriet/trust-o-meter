import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { Profile } from '../../../store/model/profile';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import Spinner from '../../UI/Spinner/Spinner';

interface FindContactsProps {
  searchResult: Profile[];
  loading: boolean;
  addingSuccess: boolean;
  error: string | null;
}

const FindContacts = (props: FindContactsProps) => {
  const [searchString, setSearchString] = useState('');
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

  const handleKeyDown = useCallback((event) => {
    if (event.keyCode === 13) { // enter
      handleFindContacts();
    }
  }, [handleFindContacts]);

  const handleAddContact = useCallback(
    (contact: Profile) => {
      dispatch(actions.createContactRequest(contact.identificator));
    },
    [dispatch],
  )

  let contactsList;
  if (props.loading) {
    contactsList = <Spinner />
  } else if (searchRequestSent && props.searchResult.length === 0) {
    contactsList = <div>No contacts found</div>
  } else {
    contactsList = (
      <>
      {props.searchResult.map(contact => (
        <div key={contact.identificator}>
          <div>
            {contact.avatarUrl == null || contact.avatarUrl === '' ? null : <img src={contact.avatarUrl} alt={contact.username} />}
          </div>
          <div>{contact.username}</div>
          <button onClick={() => handleAddContact(contact)}>Add</button>
        </div>
      ))}
      </>
    );
  }
  return (searchRequestSent && props.addingSuccess && !props.error) ? 
  <Redirect to="/" /> :
  (
    <div>
      <input
        value={searchString}
        onChange={event => setSearchString(event.target.value)}
        onKeyDown={event => handleKeyDown(event)}
      />
      <button onClick={handleFindContacts}>Find</button>
      {props.error ? <Error>{props.error}</Error> : null}
      {contactsList}
    </div>
  );
};

FindContacts.propTypes = {};

const mapStateToProps = (state: State): FindContactsProps => {
  return {
    searchResult: state.contacts.searchResult,
    loading: state.contacts.loading,
    addingSuccess: state.contacts.contactOperationFinished,
    error: state.contacts.error
  };
};

export default connect(mapStateToProps)(withAuthCheck(FindContacts));
