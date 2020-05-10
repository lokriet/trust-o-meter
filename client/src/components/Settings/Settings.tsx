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
import { useDispatch } from 'react-redux';

import withAuthCheck from '../../hoc/withAuthCheck';
import * as actions from '../../store/actions';
import {
  InstallPromptContext,
  InstallPromptContextValue
} from '../InstallPromptContext/InstallPromptContext';
import classes from './Settings.module.scss';

const Settings = (props) => {
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

  return (
    <div className={classes.Content}>
      {installPromptValues.installPrompt &&
      installPromptValues.showInstallButton ? (
        <div>
          <button onClick={handleInstallClicked}>Add to Home screen</button>
        </div>
      ) : null}

      {showNotificationSettings ? (
        <div>
          <button onClick={handleEnableNotifications}>
            Enable notifications
          </button>
        </div>
      ) : null}
    </div>
  );
};

Settings.propTypes = {};

export default withAuthCheck(Settings);
