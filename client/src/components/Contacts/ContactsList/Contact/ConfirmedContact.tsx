import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { connect } from 'react-redux';

import useProfile from '../../../../hooks/useProfile';
import * as actions from '../../../../store/actions';
import { Contact } from '../../../../store/model/contact';
import { Gender, Profile } from '../../../../store/model/profile';
import { Status } from '../../../../store/model/status';
import { State } from '../../../../store/reducers/state';
import Avatar from '../../../UI/Avatar/Avatar';
import { Error as UIError } from '../../../UI/Error/Error';
import classes from './ConfirmedContact.module.scss';
import ContactStatusList from './ContactStatusList/ContactStatusList';

interface ConfirmedContactProps {
  contact: Contact;
  error: string | null;
  statusList: Status[];
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

const ConfirmedContact = (props: ConfirmedContactProps) => {
  const [loading, setLoading] = useState(false);
  const [myCustomName, setMyCustomName] = useState(props.contact.myCustomName);
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  const dispatch = useDispatch();
  const profile: Profile = useProfile();

  const getTrustPoints = useCallback(() => {
    return Math.floor(
      (props.contact.myTrustPoints + props.contact.contactTrustPoints) / 2
    );
  }, [props.contact.myTrustPoints, props.contact.contactTrustPoints]);

  useEffect(() => {
    let contactStatus: string | null = null;
    const tp = getTrustPoints();
    props.statusList.forEach((status: Status) => {
      if (status.minTrust <= tp) {
        contactStatus = status.name;
      }
    });
    setContactStatus(contactStatus);
  }, [getTrustPoints, props.statusList]);

  const handleIncreaseTrust = useCallback((event) => {
    event.stopPropagation();
    setLoading(true);
    dispatch(
      actions.increaseContactTrust(
        props.contact.contactProfile.identificator,
        () => setLoading(false)
      )
    );
  }, [props.contact, dispatch]);

  const handleDecreaseTrust = useCallback((event) => {
    event.stopPropagation();
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

  const toggleShowExtraDetails = useCallback(() => {
    setShowExtraDetails(!showExtraDetails);
  }, [showExtraDetails]);

  return (
    <>
      <div className={classes.ContactCard} onClick={toggleShowExtraDetails}>
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

            <div className={classes.TotalTrustPoints}>{getTrustPoints()}tp</div>
            {contactStatus ? (
              <div className={classes.ContactCardStatus}>[{contactStatus}]</div>
            ) : null}
          </div>
        </div>

        {props.error ? <UIError>{props.error}</UIError> : null}

        <div className={classes.ActionButtons}>
          <button
            className={`${classes.ActionButton} ${classes.DangerActionButton}`}
            onClick={(event) => handleDecreaseTrust(event)}
            disabled={loading || props.contact.myTrustPoints < 0.01}
          >
            Doubt {getPronoun(props.contact.contactProfile.gender)}
          </button>
          <button
            className={classes.ActionButton}
            onClick={event => handleIncreaseTrust(event)}
            disabled={loading}
          >
            Trust {getPronoun(props.contact.contactProfile.gender)}
          </button>
        </div>
      </div>
      {showExtraDetails ? (
        <>
          <div>
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
          </div>

          <div>
            <div>my trust: {props.contact.myTrustPoints}</div>
            <div>their TODO trust: {props.contact.contactTrustPoints}</div>
            <div>TP: {getTrustPoints()}</div>
          </div>
          <ContactStatusList contact={props.contact} />
        </>
      ) : null}
    </>
  );
};

ConfirmedContact.propTypes = {
  contact: PropTypes.object,
  error: PropTypes.string
};

const mapStateToProps = (state: State): Partial<ConfirmedContactProps> => {
  return {
    statusList: state.status.statusList
  };
};

export default connect(mapStateToProps)(ConfirmedContact);
