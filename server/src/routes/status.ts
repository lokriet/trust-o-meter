import express from 'express';

import * as statusController from '../controllers/status';
import isAdmin from '../middleware/admin';
import isAuthenticated from '../middleware/auth';

const router = express.Router();

router.put('/:statusId/actions/:actionId', isAuthenticated, isAdmin, statusController.updateAction);
router.delete('/:statusId/actions/:actionId', isAuthenticated, isAdmin, statusController.deleteAction);
router.post('/:statusId/actions', isAuthenticated, isAdmin, statusController.createAction);

router.put('/:statusId', isAuthenticated, isAdmin, statusController.updateStatus);
router.delete('/:statusId', isAuthenticated, isAdmin, statusController.deleteStatus);
router.post('/', isAuthenticated, isAdmin, statusController.createStatus);

router.get('/', isAuthenticated, statusController.getStatusList);

export default router;