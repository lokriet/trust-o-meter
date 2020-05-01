import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../store/actions';
import { Contact } from '../../../../store/model/contact';
import { Gender } from '../../../../store/model/profile';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error as UIError } from '../../../UI/Error/Error';
import ContactStatusList from './ContactStatusList/ContactStatusList';

interface ContactProps {
  contact: Contact;
  error: string | null;
}

const getPronoun = (gender: Gender | undefined): string => {
  if (!gender) {
    throw new Error('Inconsistent state');
  }
  switch (gender) {
    case Gender.Female:
      return 'her';
    case Gender.Male:
      return 'him';
    case Gender.Other:
      return 'them';
  }
};

const ConfirmedContact = (props: ContactProps) => {
  const [loading, setLoading] = useState(false);
  const [myCustomName, setMyCustomName] = useState(props.contact.myCustomName);
  const dispatch = useDispatch();

  const getTrustPoints = useCallback(() => {
    return Math.floor(
      (props.contact.myTrustPoints + props.contact.contactTrustPoints) / 2
    );
  }, [props.contact]);

  const handleIncreaseTrust = useCallback(() => {
    setLoading(true);
    dispatch(
      actions.increaseContactTrust(
        props.contact.contactProfile.identificator, 
        () => setLoading(false)
      )
    );
  }, [props.contact, dispatch]);

  const handleDecreaseTrust = useCallback(() => {
    setLoading(true);
    dispatch(
      actions.decreaseContactTrust(
        props.contact.contactProfile.identificator,
        () => setLoading(false)
      )
    );
  }, [props.contact, dispatch]);

  const handleChangeCustomName = useCallback(() => {
    setLoading(true);
    dispatch(
      actions.updateContactCustomName(
        props.contact.contactProfile.identificator,
        myCustomName,
        () => setLoading(false)
      )
    );
  }, [props.contact, dispatch, myCustomName]);

  const handleDelete = useCallback(() => {
    // TODO - are you sure you want to delete
    setLoading(true);
    dispatch(
      actions.deleteContact(props.contact.contactProfile.identificator, () =>
        setLoading(false)
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
        <div>my trust: {props.contact.myTrustPoints}</div>
      <div>their TODO trust: {props.contact.contactTrustPoints}</div>
      <div>TP: {getTrustPoints()}</div>
      {props.error ? <UIError>{props.error}</UIError> : null}
      <div>
        <button onClick={handleIncreaseTrust} disabled={loading}>
          Trust {getPronoun(props.contact.contactProfile.gender)}
        </button>
        <button onClick={handleDecreaseTrust} disabled={loading || props.contact.myTrustPoints < 0.01}>
          Doubt {getPronoun(props.contact.contactProfile.gender)}
        </button>
      </div>
      <div>
        <input
          type="text"
          defaultValue={props.contact.myCustomName || ''}
          onChange={(event) => setMyCustomName(event.target.value)}
        />
        <button onClick={handleChangeCustomName} disabled={loading}>
          Change custom name
        </button>
      </div>
      <div>
        <button onClick={handleDelete} disabled={loading}>
          Delete
        </button>
      </div>
      <ContactStatusList contact={props.contact} />
    </div>
  );
};

ConfirmedContact.propTypes = {
  contact: PropTypes.object,
  error: PropTypes.string
};

export default ConfirmedContact;
