import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { Contact, ContactStatus } from '../../../../store/model/contact';
import Avatar from '../../../UI/Avatar/Avatar';

interface OutgoingRequestProps {
  contact: Contact;
}

const OutgoingRequest = (props: OutgoingRequestProps) => {
  const handleWithdraw = useCallback(() => {
    // TODO
    console.log('withdraw');
  }, [props.contact]);

  const handleConfirm = useCallback(() => {
    // TODO
    console.log('seen rejected request');
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
      {props.contact.status === ContactStatus.OutgoingRequest ? (
        <div>Invitation sent</div>
      ) : null}
      {props.contact.status === ContactStatus.RequestDenied ? (
        <div>Request denied</div>
      ) : null}
      <div>
        {props.contact.status === ContactStatus.OutgoingRequest ? (
          <button onClick={handleWithdraw}>Withdraw</button>
        ) : null}
        {props.contact.status === ContactStatus.RequestDenied ? (
          <button onClick={handleConfirm}>Ok</button>
        ) : null}
      </div>
    </div>
  );
};

OutgoingRequest.propTypes = {
  contact: PropTypes.object
};

export default OutgoingRequest;
