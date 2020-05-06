/*
 * Copyright (C) 2020 Evgenia Lazareva
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
