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
        props.contact.contactProfile.identificator,
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
