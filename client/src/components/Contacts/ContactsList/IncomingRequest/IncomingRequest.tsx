import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { Contact } from '../../../../store/model/contact';
import Avatar from '../../../UI/Avatar/Avatar';

interface IncomingRequestProps {
  contact: Contact;
}

const IncomingRequest = (props: IncomingRequestProps) => {
  
  const handleAccept = useCallback(() => {
    // TODO
    console.log('accept');
  }, [props.contact]);

  
  const handleDecline = useCallback(() => {
    // TODO
    console.log('decline');
  }, [props.contact]);

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
      <div>Invitation pending</div>
      <div>
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleDecline}>Decline</button>
      </div>
    </div>
  )
}

IncomingRequest.propTypes = {
  contact: PropTypes.object
}

export default IncomingRequest
