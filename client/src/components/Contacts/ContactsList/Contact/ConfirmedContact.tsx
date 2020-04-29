import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../store/actions';
import { Contact } from '../../../../store/model/contact';
import { Gender } from '../../../../store/model/profile';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error as UIError } from '../../../UI/Error/Error';

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
  const dispatch = useDispatch();

  const getTrustPoints = useCallback(() => {
    return Math.floor(
      (props.contact.myTrustPoints + props.contact.contactTrustPoints) / 2
    );
  }, [props.contact]);

  const handleIncreaseTrust = useCallback(() => {
    // TODO
    console.log('increase trust');
  }, [props.contact]);

  const handleDecreaseTrust = useCallback(() => {
    // TODO
    console.log('decrease trust');
  }, [props.contact]);

  const handleChangeCustomName = useCallback(() => {
    // TODO
    console.log('change name');
  }, [props.contact]);

  
  const handleDelete = useCallback(() => {
    // TODO - are you sure you want to delete
    setLoading(true);
    dispatch(
      actions.deleteContact(
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
      <div>{getTrustPoints()}</div>
      {props.error ? <UIError>{props.error}</UIError> : null}
      <div>
        <button onClick={handleIncreaseTrust} disabled={loading}>Trust {getPronoun(props.contact.contactProfile.gender)}</button>
        <button onClick={handleDecreaseTrust} disabled={loading}>Doubt {getPronoun(props.contact.contactProfile.gender)}</button>

        <button onClick={handleChangeCustomName} disabled={loading}>Change custom name</button>

        <button onClick={handleDelete} disabled={loading}>Delete</button>
      </div>
    </div>
  );
};

ConfirmedContact.propTypes = {
  contact: PropTypes.object,
  error: PropTypes.string
};

export default ConfirmedContact;
