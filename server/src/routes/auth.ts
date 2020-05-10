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

import * as authController from '../controllers/auth';
import isAuthenticated from '../middleware/auth';

const router = express.Router();

/**
 * POST /auth/registerWithEmailPassword
 * request:
 * {
 *   email: string,
 *   password: string
 * }
 *
 * response:
 * code: 201
 * {
 *   token: string
 *   isAdmin: boolean
 *   waitingForEmailConfirmation: true
 *   notificationSettings: {
 *     notifyNewContact: boolean
 *     notifyTrustUpdate: boolean
 *   }
 *   profile: {
 *     initialized: false
 *     identificator: string
 *   }
 * }
 *
 * code 422 - validation error
 * code 500 - internal error
 */
router.post(
  '/registerWithEmailPassword',
  authController.registerWithEmailAndPassword
);

/**
 * POST /auth/loginWithEmailPassword
 * request:
 * {
 *   email: string,
 *   password: string
 * }
 *
 * response:
 * code: 200
 * {
 *   token: string
 *   isAdmin: boolean
 *   waitingForEmailConfirmation: boolean
 *   notificationSettings: {
 *     notifyNewContact: boolean
 *     notifyTrustUpdate: boolean
 *   }
 *   profile: {
 *     initialized: boolean
 *     identificator: string
 *     username?: string
 *     avatarUrl?: string
 *     gender?: string ('F'/'M'/'O')
 *   }
 * }
 *
 * code 401 - authentication failed
 * code 422 - validation error
 * code 500 - internal error
 */
router.post(
  '/loginWithEmailPassword',
  authController.loginWithEmailAndPassword
);

/**
 * POST /auth/loginWithGoogle
 * request:
 * {
 *   idToken: string
 * }
 *
 * response:
 * code: 200
 * {
 *   token: string
 *   isAdmin: boolean
 *   waitingForEmailConfirmation: false
 *   notificationSettings: {
 *     notifyNewContact: boolean
 *     notifyTrustUpdate: boolean
 *   }
 *   profile: {
 *     initialized: boolean
 *     identificator: string
 *     username?: string
 *     avatarUrl?: string
 *     gender?: string ('F'/'M'/'O')
 *   }
 * }
 *
 * code 401 - authentication failed
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/loginWithGoogle', authController.loginWithGoogle);

/**
 * POST /auth/loginWithFacebook
 * request:
 * {
 *   userId: string
 *   accessToken: string
 * }
 *
 * response:
 * code: 200
 * {
 *   token: string
 *   isAdmin: boolean
 *   waitingForEmailConfirmation: false
 *   notificationSettings: {
 *     notifyNewContact: boolean
 *     notifyTrustUpdate: boolean
 *   }
 *   profile: {
 *     initialized: boolean
 *     identificator: string
 *     username?: string
 *     avatarUrl?: string
 *     gender?: string ('F'/'M'/'O')
 *   }
 * }
 *
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/loginWithFacebook', authController.loginWithFacebook);

/**
 * Get user and profile details
 * GET /auth/details
 *
 * response:
 * code: 200
 * {
 *   isAdmin: boolean
 *   waitingForEmailConfirmation: boolean
 *   notificationSettings: {
 *     notifyNewContact: boolean
 *     notifyTrustUpdate: boolean
 *   }
 *   profile: {
 *     initialized: boolean
 *     identificator: string
 *     username?: string
 *     avatarUrl?: string
 *     gender?: string ('F'/'M'/'O')
 *   }
 * }
 *
 * code 401 - not authenticated
 * code 500 - internal error
 */
router.get('/details', isAuthenticated, authController.getAuthDetails);

/**
 * GET '/auth/sendConfirmationEmail'
 *
 * response
 * code 200 - OK
 * code 401 - not authenticated
 * code 500 - internal error
 */
router.get(
  '/sendConfirmationEmail',
  isAuthenticated,
  authController.sendConfirmationEmail
);

/**
 * POST '/auth/confirmEmail'
 * request:
 * {
 *   confirmationToken: string
 * }
 *
 * response
 * code 200 - OK
 * code 401 - not authenticated
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/confirmEmail', isAuthenticated, authController.confirmEmail);

/**
 * POST '/auth/sendPasswordResetEmail'
 * request:
 * {
 *   email: string
 * }
 *
 * response:
 * code 200 - OK
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/sendPasswordResetEmail', authController.sendPasswordResetEmail);

/**
 * POST '/auth/resetPassword'
 * request:
 * {
 *   password: string
 *   resetPasswordToken: string
 * }
 *
 * response:
 * code 200 - OK
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/resetPassword', authController.resetPassword);

export default router;
