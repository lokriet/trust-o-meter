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


export const NotificationsActionTypes = {};

export const enableNotifications = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      if ('serviceWorker' in navigator) {
        const swRegistration = await navigator.serviceWorker.ready;
        let subscription = await swRegistration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(env.vapidPublicKey)
          });
        }

        const token = getState().auth.token;
        const result = await fetch(`${env.serverUrl}/notifications/subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(subscription)
        });

        if (result.status === 200) {
          // const resultData = await result.json();
          // dispatch(profileOperationSuccess(resultData));
          console.log('notifications subscription updated');
          navigator.serviceWorker.ready.then((swreg) => {
            const options = {
              body: 'You will now receive notifications as stuff happenz',
              icon: `${process.env.PUBLIC_URL}/icons/icon96.png`,
              badge: `${process.env.PUBLIC_URL}/icons/icon96.png`,
              tag: 'confirm-notification',
              renotify: true,
              actions: [
                {
                  action: 'confirm',
                  title: 'Okay'
                },
                {
                  action: 'cancel',
                  title: 'Cancel'
                }
              ]
            }
            swreg.showNotification('Notifications for Trust-o-Meter enabled! (hello from sw)', options);
          })
        } else {
          console.log('failed to update notifications subscription');
          // dispatch(profileOperationFailed('Profile update failed'));
        }
      }
    } catch (error) {
      console.log('failed to update notifications subscription');
      // dispatch(profileOperationFailed('Profile update failed'));
    }
  };
};
