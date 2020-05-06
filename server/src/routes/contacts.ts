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

router.post('/updateCustomName', isAuthenticated, contactsController.updateContactCustomName);
router.post('/updateTrust', isAuthenticated, contactsController.updateContactTrust);
router.post('/changeActionState', isAuthenticated, contactsController.changeActionState);

export default router;