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
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../store/actions';
import { Profile } from '../../../../store/model/profile';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error } from '../../../UI/Error/Error';
import Spinner from '../../../UI/Spinner/Spinner';
import classes from './FoundContact.module.scss';

 
interface FoundContactProps {
  contact: Profile;
}

const FoundContact = (props: FoundContactProps) => {
  const [loading, setLoading] = useState(false);
  const [addingError, setAddingError] = useState(false);
  const dispatch = useDispatch();

  const handleAddContactDone = useCallback((success: boolean) => {
    setLoading(false);
    setAddingError(!success);
  }, []);

  const handleAddContact = useCallback(
    (contact: Profile) => {
      setLoading(true);
      dispatch(
        actions.createContactRequest(
          contact.identificator,
          handleAddContactDone
        )
      );
    },
    [dispatch, handleAddContactDone]
  );

  return (
    <div className={classes.ContactCard}>
      <div className={classes.ContactInfo}>
        <div className={classes.ContactAvatar}>
          <Avatar avatarUrl={props.contact.avatarUrl || ''} />
        </div>
        <div className={classes.ContactDetails}>
          <div className={classes.ContactName}>
            {props.contact.username || '<noname>'}
          </div>

          {addingError ? <Error className={classes.Error}>Friend request failed. Please try again.</Error> : null}

          <div className={classes.ActionButtons}>
            <button
              className={classes.ActionButton}
              onClick={() => handleAddContact(props.contact)}
              disabled={loading}
            >
              {loading ? <Spinner className="ButtonSpinner" /> : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

FoundContact.propTypes = {
  contact: PropTypes.object.isRequired
};

export default FoundContact;
