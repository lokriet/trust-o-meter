import express from 'express';

import * as statusController from '../controllers/status';
import isAdmin from '../middleware/admin';
import isAuthenticated from '../middleware/auth';

const router = express.Router();

router.post('/', isAuthenticated, isAdmin, statusController.createStatus);
router.get('/', isAuthenticated, statusController.getStatusList)

export default router;