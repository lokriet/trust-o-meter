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

import useProfile from '../../../../hooks/useProfile';
import * as actions from '../../../../store/actions';
import { Contact } from '../../../../store/model/contact';
import { Profile } from '../../../../store/model/profile';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error } from '../../../UI/Error/Error';
import classes from './DeletedContact.module.scss';

 
interface DeletedContactProps {
  contact: Contact;
  error: string | null;
}

const DeletedContact = (props: DeletedContactProps) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const profile: Profile = useProfile();

  const handleConfirmDeletedContact = useCallback(() => {
    setLoading(true);
    dispatch(
      actions.confirmSeenDeletedContact(
        props.contact._id,
        () => setLoading(false)
      )
    );
  }, [props.contact, dispatch]);

  return (
    <div className={classes.ContactCard}>
      <div className={classes.ContactInfo}>
        <div className={classes.ContactAvatar}>
          <Avatar avatarUrl={props.contact.contactProfile.avatarUrl || ''} />
        </div>
        <div className={classes.ContactDetails}>
          <div className={classes.ContactName}>
            {props.contact.contactCustomName ||
              props.contact.contactProfile.username ||
              '<noname>'}
          </div>
          <div className={classes.UserName}>
            {`& ${props.contact.myCustomName || profile.username}`}
          </div>

          <div className={classes.ContactCardStatus}>
            [user deleted you from their contact list]
          </div>
        </div>
      </div>

      {props.error ? <Error>{props.error}</Error> : null}

      <div className={classes.ActionButtons}>
        <button
          className={classes.ActionButton}
          onClick={handleConfirmDeletedContact}
          disabled={loading}
        >
          OK
        </button>
      </div>
    </div>
  );
};

DeletedContact.propTypes = {
  contact: PropTypes.object,
  error: PropTypes.string
};

export default DeletedContact;
