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

/**
 * GET /contacts
 *
 * response:
 * code: 200
 * [
 *   {
 *     _id: string;
 *     status: ContactStatus;
 *     contactProfile: any;
 *     myCustomName: string | null;
 *     contactCustomName: string | null;
 *     myTrustPoints: number;
 *     contactTrustPoints: number;
 *     doneActions: string[];
 *   }
 * ]
 *
 * code 401 - not authenticated
 * code 500 - internal error
 */
router.get('/', isAuthenticated, contactsController.getContacts);

/**
 * POST /contacts/search
 * request:
 * {
 *   searchString: string
 * }
 *
 * response:
 * code: 200
 * [
 *   {
 *     identificator: string
 *     username: string
 *     gender: string
 *     avatarUrl: string
 *   }
 * ]
 *
 * code 401 - not authenticated
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/search', isAuthenticated, contactsController.searchContacts);

/**
 * POST /contacts/request
 * request:
 * {
 *   identificator: string
 * }
 *
 * Sends push notification & socket update
 *
 * response:
 * code: 200
 * {
 *   _id: string;
 *   status: ContactStatus;
 *   contactProfile: any;
 *   myCustomName: string | null;
 *   contactCustomName: string | null;
 *   myTrustPoints: number;
 *   contactTrustPoints: number;
 *   doneActions: string[];
 *   }
 *
 * code 401 - not authenticated
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/request', isAuthenticated, contactsController.requestContact);

/**
 * POST /contacts/:contactId/approve
 *
 * Sends socket update
 *
 * response:
 * code: 200
 * {
 *   _id: string;
 *   status: ContactStatus;
 *   contactProfile: any;
 *   myCustomName: string | null;
 *   contactCustomName: string | null;
 *   myTrustPoints: number;
 *   contactTrustPoints: number;
 *   doneActions: string[];
 * }
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 500 - internal error
 */
router.post(
  '/:contactId/approve',
  isAuthenticated,
  contactsController.approveContactRequest
);

/**
 * POST /contacts/:contactId/reject
 *
 * Sends socket update
 *
 * response:
 * code: 200
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 500 - internal error
 */
router.post(
  '/:contactId/reject',
  isAuthenticated,
  contactsController.rejectContactRequest
);

/**
 * POST /contacts/:contactId/withdraw
 *
 * Sends socket delete
 *
 * response:
 * code: 200
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 500 - internal error
 */
router.post(
  '/:contactId/withdraw',
  isAuthenticated,
  contactsController.withdrawContactRequest
);

/**
 * POST /contacts/:contactId/seenRequestReject
 *
 * response:
 * code: 200
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 500 - internal error
 */
router.post(
  '/:contactId/seenRequestReject',
  isAuthenticated,
  contactsController.confirmRequestRejectSeen
);

/**
 * POST /contacts/:contactId/delete
 *
 * Sends socket update
 *
 * response:
 * code: 200
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 500 - internal error
 */
router.post(
  '/:contactId/delete',
  isAuthenticated,
  contactsController.deleteContact
);

/**
 * POST /contacts/:contactId/seenContactDelete
 *
 * response:
 * code: 200
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 500 - internal error
 */
router.post(
  '/:contactId/seenContactDelete',
  isAuthenticated,
  contactsController.confirmDeletedContactSeen
);

/**
 * POST /contacts/:contactId/updateCustomName
 * request: {
 *   customName: string
 * }
 *
 * Sends socket update
 *
 * response:
 * code: 200
 * {
 *   _id: string;
 *   status: ContactStatus;
 *   contactProfile: any;
 *   myCustomName: string | null;
 *   contactCustomName: string | null;
 *   myTrustPoints: number;
 *   contactTrustPoints: number;
 *   doneActions: string[];
 * }
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 422 - validation error
 * code 500 - internal error
 */
router.post(
  '/:contactId/updateCustomName',
  isAuthenticated,
  contactsController.updateContactCustomName
);

/**
 * POST /contacts/:contactId/updateTrust
 * request: {
 *   increase: boolean
 * }
 *
 * Sends push notification
 * Sends socket update
 *
 * response:
 * code: 200
 * {
 *   _id: string;
 *   status: ContactStatus;
 *   contactProfile: any;
 *   myCustomName: string | null;
 *   contactCustomName: string | null;
 *   myTrustPoints: number;
 *   contactTrustPoints: number;
 *   doneActions: string[];
 * }
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 422 - validation error
 * code 500 - internal error
 */
router.post(
  '/:contactId/updateTrust',
  isAuthenticated,
  contactsController.updateContactTrust
);

/**
 * POST /contacts/:contactId/updateTrust
 * request: {
 *   statusId: string
 *   actionId: string
 *   actionDone: boolean
 * }
 *
 * Sends socket update
 *
 * response:
 * code: 200
 * {
 *   _id: string;
 *   status: ContactStatus;
 *   contactProfile: any;
 *   myCustomName: string | null;
 *   contactCustomName: string | null;
 *   myTrustPoints: number;
 *   contactTrustPoints: number;
 *   doneActions: string[];
 * }
 *
 * code 401 - not authenticated
 * code 404 - page not found
 * code 422 - validation error
 * code 500 - internal error
 */
router.post(
  '/:contactId/changeActionState',
  isAuthenticated,
  contactsController.changeActionState
);

export default router;
