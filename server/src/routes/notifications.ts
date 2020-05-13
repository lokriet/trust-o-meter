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
import express from 'express';

import * as notificationsController from '../controllers/notifications';
import isAuthenticated from '../middleware/auth';


const router = express.Router();

/**
 * Subscribe for push notifications for current user and current device
 * POST '/notifications/subscription'
 *
 * request: {
 *  subscription: subscription object
 * }
 *
 * response:
 * code: 200
 *
 *
 * code 401 - not authenticated
 * code 422 - validation error
 * code 500 - internal error
 */
router.post(
  '/subscription', isAuthenticated,
  notificationsController.addNotificationsSubscription
);

/**
 * Configure which push notifications to receive
 * POST '/notifications/settings'
 *
 * request: {
 *  notifyTrustUpdate?: boolean
 *  notifyNewContact?: boolean
 * }
 *
 * response:
 * code: 200
 *
 *
 * code 401 - not authenticated
 * code 422 - validation error
 * code 500 - internal error
 */
router.post(
  '/settings', isAuthenticated,
  notificationsController.updateNotificationSettings
);

export default router;