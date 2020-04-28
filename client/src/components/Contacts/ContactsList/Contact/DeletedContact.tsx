import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { Contact } from '../../../../store/model/contact';
import Avatar from '../../../UI/Avatar/Avatar';

interface DeletedContactProps {
  contact: Contact;
}

const DeletedContact = (props: DeletedContactProps) => {
  const handleConfirmDeletedContact = useCallback(
    () => {
      // TODO
      console.log('Ok..')
    },
    [],
  )
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
      <button onClick={handleConfirmDeletedContact}>OK</button>
    </div>
  );
};

DeletedContact.propTypes = {
  contact: PropTypes.object
};

export default DeletedContact;
