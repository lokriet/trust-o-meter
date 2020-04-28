import express from 'express';

import * as contactsController from '../controllers/contacts';
import isAuthenticated from '../middleware/auth';

const router = express.Router();

router.post('/search', isAuthenticated, contactsController.searchContacts);

router.post('/request', isAuthenticated, contactsController.requestContact);

router.get('/', isAuthenticated, contactsController.getContacts);

export default router;