import express from 'express';

import * as contactsController from '../controllers/contacts';
import isAuthenticated from '../middleware/auth';

const router = express.Router();

router.get('/', isAuthenticated, contactsController.getContacts);

router.post('/search', isAuthenticated, contactsController.searchContacts);

router.post('/request', isAuthenticated, contactsController.requestContact);
router.post('/approve', isAuthenticated, contactsController.approveContactRequest);

router.post('/reject', isAuthenticated, contactsController.rejectContactRequest);
router.post('/withdraw', isAuthenticated, contactsController.withdrawContactRequest);
router.post('/seenRequestReject', isAuthenticated, contactsController.confirmRequestRejectSeen);
router.post('/delete', isAuthenticated, contactsController.deleteContact);
router.post('/seenContactDelete', isAuthenticated, contactsController.confirmDeletedContactSeen);

export default router;