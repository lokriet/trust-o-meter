import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { Contact } from '../../../../../store/model/contact';
import classes from './TrustDetails.module.scss';
import TrustProgressBar from './TrustProgressBar/TrustProgressBar';

interface TrustDetailsProps {
  contact: Contact;
}

const TrustDetails = (props: TrustDetailsProps) => {
  const mutualTrust = useCallback(
    (): number => {
      return Math.floor((props.contact.myTrustPoints + props.contact.contactTrustPoints) / 2);
    },
    [props.contact],
  )

  return (
    <div className={classes.ExtraDetailsContainer}>
      <div className={classes.ExtraDetailsCard}>
        <div className={classes.Header}>
          Your trust: {props.contact.myTrustPoints}tp
        </div>
        <TrustProgressBar trustPoints={props.contact.myTrustPoints} />

        <div className={classes.Header}>
          {props.contact.contactCustomName || props.contact.contactProfile.username || '<noname>'}'s trust: {props.contact.contactTrustPoints}tp
        </div>
        <TrustProgressBar trustPoints={props.contact.contactTrustPoints} />
        
        <div className={classes.Header}>
          Mutual trust: {mutualTrust()}tp
        </div>
        <TrustProgressBar trustPoints={mutualTrust()} />
      </div>
    </div>
  )
}

TrustDetails.propTypes = {
  contact: PropTypes.object.isRequired
}

export default TrustDetails
