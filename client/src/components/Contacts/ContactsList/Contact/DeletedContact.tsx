import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../store/actions';
import { Contact } from '../../../../store/model/contact';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error } from '../../../UI/Error/Error';

interface DeletedContactProps {
  contact: Contact;
  error: string | null;
}

const DeletedContact = (props: DeletedContactProps) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

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
    <div>
      <Avatar
        avatarUrl={props.contact.contactProfile.avatarUrl || ''}
        username={
          props.contact.contactCustomName ||
          props.contact.contactProfile.username ||
          ''
        }
      />
      <div>
        {props.contact.contactCustomName ||
          props.contact.contactProfile.username ||
          '<noname>'}
      </div>
      <div>This person deleted you from their friend list</div>
      {props.error ? <Error>{props.error}</Error> : null}
      <button onClick={handleConfirmDeletedContact} disabled={loading}>OK</button>
    </div>
  );
};

DeletedContact.propTypes = {
  contact: PropTypes.object,
  error: PropTypes.string
};

export default DeletedContact;
