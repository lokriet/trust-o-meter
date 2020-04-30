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
