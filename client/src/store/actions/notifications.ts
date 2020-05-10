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
import env from '../../secret/environment';
import { urlBase64ToUint8Array } from '../../util/utility';
import { State } from '../reducers/state';
import { NotificationSettings } from '../model/notifications';

export const NotificationsActionTypes = {
  START_NOTIFICATIONS_OPERATION: 'START_NOTIFICATIONS_OPERATION',
  NOTIFICATIONS_OPERATION_FAILED: 'NOTIFICATIONS_OPERATION_FAILED',
  ENABLE_NOTIFICATIONS_SUCCESS: 'ENABLE_NOTIFICATIONS_SUCCESS',
  UPDATE_NOTIFICATION_SETTINGS_SUCCESS: 'UPDATE_NOTIFICATION_SETTINGS_SUCCESS',
  SET_NOTIFICATION_SETTINGS: 'SET_NOTIFICATION_SETTINGS',
  RESET_NOTIFICATIONS_STORE: 'RESET_NOTIFICATIONS_STORE'
};

export const enableNotifications = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      if ('serviceWorker' in navigator) {
        dispatch(startNotificationsOperation());
        const swRegistration = await navigator.serviceWorker.ready;
        let subscription = await swRegistration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(env.vapidPublicKey)
          });
        }

        const token = getState().auth.token;
        const result = await fetch(
          `${env.serverUrl}/notifications/subscription`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(subscription)
          }
        );

        if (result.status === 200) {
          navigator.serviceWorker.ready.then((swreg) => {
            const options = {
              body: 'You will now receive notifications as stuff happenz',
              icon: `${process.env.PUBLIC_URL}/icons/icon96.png`,
              badge: `${process.env.PUBLIC_URL}/icons/icon96.png`,
              tag: 'confirm-notification',
              renotify: false
            };
            swreg.showNotification(
              'Notifications for Trust-o-Meter enabled!',
              options
            );
            dispatch(enableNotificationsSuccess());
          });
        } else {
          dispatch(
            notificationsOperationFailed(
              'Failed to update notifications subscription'
            )
          );
        }
      }
    } catch (error) {
      dispatch(
        notificationsOperationFailed(
          'Failed to update notifications subscription'
        )
      );
    }
  };
};

export const updateNotificationSettings = (
  update: Partial<NotificationSettings>
) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(startNotificationsOperation());
      const token = getState().auth.token;
      const result = await fetch(
        `${env.serverUrl}/notifications/settings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(update)
        }
      );
      if (result.status === 200) {
        dispatch(updateNotificationSettingsSuccess(update));
      } else {
        dispatch(notificationsOperationFailed('Failed to update notification settings. Please check your internet connection and try again'));
      }
    } catch (error) {
      console.log(error);
      dispatch(notificationsOperationFailed('Failed to update notification settings. Please check your internet connection and try again'));
    }
  };
};

const startNotificationsOperation = () => {
  return {
    type: NotificationsActionTypes.START_NOTIFICATIONS_OPERATION
  };
};

const notificationsOperationFailed = (error: string) => {
  return {
    type: NotificationsActionTypes.NOTIFICATIONS_OPERATION_FAILED,
    error
  };
};

const enableNotificationsSuccess = () => {
  return {
    type: NotificationsActionTypes.ENABLE_NOTIFICATIONS_SUCCESS
  };
};

const updateNotificationSettingsSuccess = (
  update: Partial<NotificationSettings>
) => {
  return {
    type: NotificationsActionTypes.UPDATE_NOTIFICATION_SETTINGS_SUCCESS,
    update
  };
};

export const setNotificationSettings = (
  notificationSettings: NotificationSettings
) => {
  return {
    type: NotificationsActionTypes.SET_NOTIFICATION_SETTINGS,
    notificationSettings
  };
};

export const resetNotificationsStore = () => {
  return {
    type: NotificationsActionTypes.RESET_NOTIFICATIONS_STORE
  };
};
