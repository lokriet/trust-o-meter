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
import * as actionTypes from '../actions/actionTypes';
import { NotificationSettings } from '../model/notifications';

export interface NotificationsState {
  error: string | null;
  loading: boolean;
  notificationSettings: NotificationSettings;
}

const initialState: NotificationsState = {
  error: null,
  loading: false,
  notificationSettings: {
    notifyNewContact: true,
    notifyTrustUpdate: true
  }
};

export const notificationsReducer = (
  state: NotificationsState = initialState,
  action: any
): NotificationsState => {
  switch (action.type) {
    case actionTypes.notifications.START_NOTIFICATIONS_OPERATION:
      return {
        ...state,
        error: null,
        loading: true
      };
    case actionTypes.notifications.NOTIFICATIONS_OPERATION_FAILED:
      return {
        ...state,
        loading: false,
        error: action.error
      };
    case actionTypes.notifications.ENABLE_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };
    case actionTypes.notifications.UPDATE_NOTIFICATION_SETTINGS_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        notificationSettings: {
          ...state.notificationSettings,
          ...action.update
        }
      };
    case actionTypes.notifications.SET_NOTIFICATION_SETTINGS:
      return {
        ...state,
        notificationSettings: action.notificationSettings
      };
    case actionTypes.notifications.RESET_NOTIFICATIONS_STORE:
      return initialState;
    default:
      return state;
  }
};
