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
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { Profile } from '../../../store/model/profile';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import SearchInput from '../../UI/SearchInput/SearchInput';
import Spinner from '../../UI/Spinner/Spinner';
import classes from './FindContacts.module.scss';
import FoundContact from './FoundContact/FoundContact';

 
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
  }, [dispatch]);

  const handleFindContacts = useCallback(() => {
    const trimmed = searchString.trim();
    if (trimmed !== '') {
      dispatch(actions.searchContacts(trimmed));
      setSearchRequestSent(true);
    }
  }, [dispatch, searchString]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.keyCode === 13) {
        // enter
        handleFindContacts();
      }
    },
    [handleFindContacts]
  );

  let contactsList;
  if (props.loading) {
    contactsList = <Spinner />;
  } else if (searchRequestSent && props.searchResult.length === 0) {
    contactsList = (
      <div className={classes.SearchResult}>No contacts found</div>
    );
  } else {
    contactsList = (
      <div className={classes.SearchResult}>
        {props.searchResult.map((contact) => (
          <FoundContact key={contact.identificator} contact={contact} />
        ))}
      </div>
    );
  }
  return searchRequestSent && props.addingSuccess && !props.error ? (
    <Redirect to="/" />
  ) : (
    <div className={classes.Container}>
      <SearchInput
        placeholder="Name / Identificator"
        value={searchString}
        onChange={(event) => setSearchString(event.target.value)}
        onKeyDown={(event) => handleKeyDown(event)}
      />
      {props.error && props.searchResult.length === 0 ? <Error>{props.error}</Error> : null}
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
