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

export {
  checkInitialAuthState,
  authInit,
  setAuthRedirectPath,
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  loginWithGoogle,
  loginWithFacebook,
  logout,
  sendConfirmationEmail,
  confirmEmail,
  requestPasswordReset,
  resetPassword
} from './auth';

export { setProfile, updateProfile, resetProfileStore } from './profile';

export {
  fetchUserContacts,
  searchContacts,
  contactsOperationReset,
  
  createContactRequest,
  approveContactRequest,
  rejectContactRequest,
  confirmSeenRejectedRequest,
  withdrawContactRequest,
  deleteContact,
  confirmSeenDeletedContact,
  
  updateContactCustomName,
  increaseContactTrust,
  decreaseContactTrust,
  changeContactActionState,
  
  applyContactUpdate,
  applyContactDelete,

  resetContactsStore
} from './contacts';

export {
  fetchStatusList,
  initStatusOperation,
  initActionOperation,
  createStatus,
  updateStatus,
  deleteStatus,
  createAction,
  updateAction,
  deleteAction,
  applyStatusUpdate,
  applyStatusDelete,
  resetStatusStore
} from './status';

export {
  enableNotifications,
  updateNotificationSettings,
  setNotificationSettings,
  resetNotificationsStore
} from './notifications';

export {
  initSocketConnection,
  disconnectSocket,
  pickUpdateForShowing,
  setSocketsEnabled,
  resetSocketStore,
  changeSocketEnabledSettings
} from './socket';