import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../store/actions';
import { Contact } from '../../../../store/model/contact';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error } from '../../../UI/Error/Error';

interface IncomingRequestProps {
  contact: Contact;
  error: string | null;
}

const IncomingRequest = (props: IncomingRequestProps) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleAccept = useCallback(() => {
    setLoading(true);
    dispatch(
      actions.approveContactRequest(
        props.contact.contactProfile.identificator,
        () => setLoading(false)
      )
    );
  }, [props.contact, dispatch]);

  const handleDecline = useCallback(() => {
    setLoading(true);
    dispatch(
      actions.rejectContactRequest(
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
      <div>Invitation pending</div>
      {props.error ? <Error>{props.error}</Error> : null}
      <div>
        <button onClick={handleAccept} disabled={loading}>Accept</button>
        <button onClick={handleDecline} disabled={loading}>Decline</button>
      </div>
    </div>
  );
};

IncomingRequest.propTypes = {
  contact: PropTypes.object.isRequired,
  error: PropTypes.string
};

export default IncomingRequest;
