import express from 'express';
import isAuthenticated from '../middleware/auth';
import * as profileController from '../controllers/profile';

const router = express.Router();

/**
 * Update current user profile
 * PUT "/profile"
 * request:
 * {
 *   username?: string
 *   avatarUrl?: string
 *   gender?: string 'F'/'M'/'O'
 * }
 *
 * response:
 * 200 - OK
 * profile: {
 *   initialized: boolean
 *   identificator: string
 *   username?: string
 *   avatarUrl?: string
 *   gender?: string ('F'/'M'/'O')
 * }
 *
 * code 401 - not authenticated
 * code 422 - validation error
 * code 500 - internal error
 */
router.put('/', isAuthenticated, profileController.updateProfile);

export default router;