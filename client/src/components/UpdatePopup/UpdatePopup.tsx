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

 import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { CSSTransition } from 'react-transition-group';

import * as actions from '../../store/actions';
import { SocketContactUpdate, ContactEventTypes } from '../../store/model/socketUpdate';
import { State } from '../../store/reducers/state';
import Avatar from '../UI/Avatar/Avatar';
import classes from './UpdatePopup.module.scss';

interface UpdatePopupProps {
  updates: SocketContactUpdate[];
}

const UpdatePopup = (props: UpdatePopupProps) => {
  const [
    currentUpdate,
    setCurrentUpdate
  ] = useState<SocketContactUpdate | null>(null);
  const [timer, setTimer] = useState<any|null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentUpdate == null && props.updates.length > 0) {
      setCurrentUpdate(props.updates[props.updates.length - 1]);
      dispatch(
        actions.pickUpdateForShowing(props.updates[props.updates.length - 1].id)
      );

      const timer = setTimeout(() => {
        setCurrentUpdate(null);
        setTimer(null);
      }, 10000);
      setTimer(timer);
    }
  }, [currentUpdate, props.updates, dispatch]);

  const handleClosePopup = useCallback(() => {
    if (timer) {
      clearTimeout(timer);
    }
    setTimer(null);
    setCurrentUpdate(null);
  }, [timer]);

  const getUpdateText = () => {
    if (!currentUpdate) {
      return null;
    } else {
      switch (currentUpdate.updateType) {
        case ContactEventTypes.ContactRequest:
          return `Woot! You got a new contact request from ${currentUpdate.contact.contactProfile.username}`
        case ContactEventTypes.ContactRequestApproved:
          return `Woot! Your contact request is approved by ${currentUpdate.contact.contactProfile.username}`
        case ContactEventTypes.ContactRequestRejected:
          return `Oh no! Your contact request is rejected by ${currentUpdate.contact.contactProfile.username}`
        case ContactEventTypes.ContactRequestWithdrawn:
          return `Oh no! Incoming contact request by ${currentUpdate.contact.contactProfile.username} is withdrawn`
        
        case ContactEventTypes.ContactTrustUpdated:
          return `${currentUpdate.contact.contactCustomName || currentUpdate.contact.contactProfile.username} changed their trust towards you`
        case ContactEventTypes.ContactNameUpdated:
          if (currentUpdate.contact.contactCustomName != null && currentUpdate.contact.contactCustomName !== '') {
            return `${currentUpdate.contact.contactProfile.username} changed their name to ${currentUpdate.contact.contactCustomName} just for you`
          } else {
            return `${currentUpdate.contact.contactProfile.username} reset their custom name`
          }
        case ContactEventTypes.ContactDoneActionsUpdated:
          return `${currentUpdate.contact.contactCustomName || currentUpdate.contact.contactProfile.username} updated activities you did together`

        case ContactEventTypes.ContactDeleted:
          return `Oh no! ${currentUpdate.contact.contactCustomName || currentUpdate.contact.contactProfile.username} deleted you from contact list`
      }
    }
  }

  return (
    <CSSTransition
      timeout={500}
      in={currentUpdate !== null}
      unmountOnExit
      classNames={{
        enter: classes.PopupEnter,
        enterActive: classes.PopupEnterActive,
        exit: classes.PopupExit,
        exitActive: classes.PopupExitActive
      }}
    >
      <div className={classes.Popup}>
        <div className={classes.CloseButton}>
          <FontAwesomeIcon
            icon={faTimes}
            className={classes.CloseButtonIcon}
            onClick={handleClosePopup}
          />
        </div>
        <div className={classes.Avatar}>
          <Avatar  avatarUrl={currentUpdate?.contact.contactProfile.avatarUrl || ''} />
        </div>
        <div className={classes.UpdateText}>
          {getUpdateText()}
        </div>
      </div>
    </CSSTransition>
  );
};

UpdatePopup.propTypes = {};

const mapStateToProps = (state: State): UpdatePopupProps => {
  return {
    updates: state.socket.updates
  };
};

export default connect(mapStateToProps)(UpdatePopup);
