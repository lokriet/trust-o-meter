import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import useProfile from '../../../../hooks/useProfile';
import * as actions from '../../../../store/actions';
import { Contact, ContactStatus } from '../../../../store/model/contact';
import { Profile } from '../../../../store/model/profile';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error } from '../../../UI/Error/Error';
import classes from './OutgoingRequest.module.scss';

interface OutgoingRequestProps {
  contact: Contact;
  error: string | null;
}

const OutgoingRequest = (props: OutgoingRequestProps) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const profile: Profile = useProfile();

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
            {props.contact.status === ContactStatus.OutgoingRequest
              ? '[invitation sent]'
              : props.contact.status === ContactStatus.RequestDenied
              ? '[request denied]'
              : null}
          </div>
        </div>
      </div>

      {props.error ? <Error>{props.error}</Error> : null}

      <div className={classes.ContactActionButtons}>
        {props.contact.status === ContactStatus.OutgoingRequest ? (
          <button
            className={`${classes.ContactActionButton} ${classes.ContactDangerActionButton}`}
            onClick={handleWithdraw}
            disabled={loading}
          >
            Withdraw
          </button>
        ) : null}
        {props.contact.status === ContactStatus.RequestDenied ? (
          <button
            className={classes.ContactActionButton}
            onClick={handleConfirm}
            disabled={loading}
          >
            OK
          </button>
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
