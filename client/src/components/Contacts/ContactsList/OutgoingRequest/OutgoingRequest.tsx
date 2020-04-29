import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../store/actions';
import { Contact, ContactStatus } from '../../../../store/model/contact';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error } from '../../../UI/Error/Error';

interface OutgoingRequestProps {
  contact: Contact;
  error: string | null;
}

const OutgoingRequest = (props: OutgoingRequestProps) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleWithdraw = useCallback(() => {
    setLoading(true);
    dispatch(
      actions.withdrawContactRequest(
        props.contact.contactProfile.identificator,
        () => setLoading(false)
      )
    );
  }, [props.contact, dispatch]);

  const handleConfirm = useCallback(() => {
    setLoading(true);
    dispatch(
      actions.confirmSeenRejectedRequest(
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
      {props.contact.status === ContactStatus.OutgoingRequest ? (
        <div>Invitation sent</div>
      ) : null}
      {props.contact.status === ContactStatus.RequestDenied ? (
        <div>Request denied</div>
      ) : null}
      {props.error ? <Error>{props.error}</Error> : null}
      <div>
        {props.contact.status === ContactStatus.OutgoingRequest ? (
          <button onClick={handleWithdraw} disabled={loading}>Withdraw</button>
        ) : null}
        {props.contact.status === ContactStatus.RequestDenied ? (
          <button onClick={handleConfirm} disabled={loading}>Ok</button>
        ) : null}
      </div>
    </div>
  );
};

OutgoingRequest.propTypes = {
  contact: PropTypes.object,
  error: PropTypes.string
};

export default OutgoingRequest;
