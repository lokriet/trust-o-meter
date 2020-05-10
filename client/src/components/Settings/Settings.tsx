
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

 import React, { useCallback, useContext, useState } from 'react';
import { connect, useDispatch } from 'react-redux';

import withAuthCheck from '../../hoc/withAuthCheck';
import * as actions from '../../store/actions';
import { NotificationSettings } from '../../store/model/notifications';
import { State } from '../../store/reducers/state';
import { InstallPromptContext, InstallPromptContextValue } from '../InstallPromptContext/InstallPromptContext';
import { Error } from '../UI/Error/Error';
import classes from './Settings.module.scss';

interface SettingsProps {
  error: string;
  loading: boolean;
  notificationSettings: NotificationSettings;
}

const Settings = (props: SettingsProps) => {
  const dispatch = useDispatch();

  const installPromptValues: InstallPromptContextValue = useContext(
    InstallPromptContext
  );
  const [showNotificationSettings] = useState(
    'Notification' in window && 'serviceWorker' in navigator
  );

  const handleInstallClicked = useCallback(() => {
    installPromptValues.installPrompt.prompt();
    // Wait for the user to respond to the prompt
    installPromptValues.installPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
          installPromptValues.setShowInstallButton(false);
        } else {
          console.log('App not installed');
        }
      })
      .catch((error) => {
        console.log('Failed to install app', error);
      });
  }, [installPromptValues]);

  const handleEnableNotifications = useCallback(() => {
    Notification.requestPermission().then((result: NotificationPermission) => {
      console.log('Notification permission', result);
      if (result === 'granted') {
        dispatch(actions.enableNotifications());
      }
    });
  }, [dispatch]);

  const handleNotifyTrustUpdateChanged = useCallback(() => {
    dispatch(
      actions.updateNotificationSettings({
        notifyTrustUpdate: !props.notificationSettings.notifyTrustUpdate
      })
    );
  }, [dispatch, props.notificationSettings.notifyTrustUpdate]);

  const handleNotifyNewContactChanged = useCallback(() => {
    dispatch(
      actions.updateNotificationSettings({
        notifyNewContact: !props.notificationSettings.notifyNewContact
      })
    );
  }, [dispatch, props.notificationSettings.notifyNewContact]);

  return (
    <div className={classes.Content}>
      {installPromptValues.installPrompt &&
      installPromptValues.showInstallButton ? (
        <div>
          <h1>Add application link to your home screen</h1>
          <p>Quick and easy access to Trust-o-Meter at your fingertips</p>
          <button
            className={classes.ActionButton}
            onClick={handleInstallClicked}
          >
            Add to Home screen
          </button>
        </div>
      ) : null}

      {showNotificationSettings ? (
        <div>
          <h1>Enable push notifications</h1>
          <p>
            You can always disable push notifications in app settings on your
            device
          </p>
          <button
            className={classes.ActionButton}
            onClick={handleEnableNotifications}
          >
            Enable notifications on this device
          </button>
          <div className={classes.NotificationCheckboxRow}>
            <input
              className={classes.NotificationCheckbox}
              type="checkbox"
              id="notifyTrustUpdate"
              checked={props.notificationSettings.notifyTrustUpdate}
              onChange={handleNotifyTrustUpdateChanged}
              disabled={props.loading}
            />
            <label htmlFor="notifyTrustUpdate">
              Get contact's trust changes notifications
            </label>
          </div>
          <div className={classes.NotificationCheckboxRow}>
            <input
              className={classes.NotificationCheckbox}
              type="checkbox"
              id="notifyNewContact"
              checked={props.notificationSettings.notifyNewContact}
              onChange={handleNotifyNewContactChanged}
              disabled={props.loading}
            />
            <label htmlFor="notifyNewContact">
              Get new contact requests notifications
            </label>
          </div>
        </div>
      ) : null}
      {props.error ? <Error>{props.error}</Error> : null}
    </div>
  );
};

Settings.propTypes = {};

const mapStateToProps = (state: State) => {
  return {
    loading: state.notifications.loading,
    error: state.notifications.error,
    notificationSettings: state.notifications.notificationSettings
  };
};

export default connect(mapStateToProps)(withAuthCheck(Settings));
