import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { Contact } from '../../../../store/model/contact';
import { Gender } from '../../../../store/model/profile';
import Avatar from '../../../UI/Avatar/Avatar';

interface ContactProps {
  contact: Contact;
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
      <div>
        <button onClick={handleIncreaseTrust}>Trust {getPronoun(props.contact.contactProfile.gender)}</button>
        <button onClick={handleDecreaseTrust}>Doubt {getPronoun(props.contact.contactProfile.gender)}</button>

        <button onClick={handleChangeCustomName}>Change custom name</button>
      </div>
    </div>
  );
};

ConfirmedContact.propTypes = {
  contact: PropTypes.object
};

export default ConfirmedContact;
