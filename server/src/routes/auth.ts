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

router.post('/loginWithFacebook', authController.loginWithFacebook);

/**
 * Get user and profile details
 * GET /auth/details
 *
 * response:
 * code: 200
 * {
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


router.get('/sendConfirmationEmail', isAuthenticated, authController.sendConfirmationEmail);

router.post('/confirmEmail', isAuthenticated, authController.confirmEmail);

router.post('/sendPasswordResetEmail', authController.sendPasswordResetEmail);

router.post('/resetPassword', authController.resetPassword);

export default router;
