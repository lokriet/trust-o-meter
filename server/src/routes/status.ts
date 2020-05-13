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

import * as statusController from '../controllers/status';
import isAdmin from '../middleware/admin';
import isAuthenticated from '../middleware/auth';


const router = express.Router();

/**
 * Update action name
 * PUT '/status/:statusId/actions/:actionId'
 * request: {
 *  name: string
 * }
 *
 * Send socket update in common channel
 *
 * response: updated _status_
 * code: 200
 * {
 *  name: string
 *  minTrust: number
 *  actions: [
 *    {
 *      name: string
 *    }
 *  ]
 * }
 *
 * code 401 - not authenticated
 * code 403 - not authorized
 * code 404 - page not found
 * code 422 - validation error
 * code 500 - internal error
 */
router.put('/:statusId/actions/:actionId', isAuthenticated, isAdmin, statusController.updateAction);

/**
 * Delete
 * DELETE '/status/:statusId/actions/:actionId'
 *
 * Send socket update in common channel
 *
 * response: updated _status_
 * code: 200
 * {
 *  name: string
 *  minTrust: number
 *  actions: [
 *    {
 *      name: string
 *    }
 *  ]
 * }
 *
 * code 401 - not authenticated
 * code 403 - not authorized
 * code 404 - page not found
 * code 500 - internal error
 */
router.delete('/:statusId/actions/:actionId', isAuthenticated, isAdmin, statusController.deleteAction);

/**
 * Create new action
 * POST '/status/:statusId/actions'
 * request: {
 *  name: string
 * }
 *
 * Send socket update in common channel
 *
 * response: updated _status_
 * code: 201
 * {
 *  name: string
 *  minTrust: number
 *  actions: [
 *    {
 *      name: string
 *    }
 *  ]
 * }
 *
 * code 401 - not authenticated
 * code 403 - not authorized
 * code 404 - page not found
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/:statusId/actions', isAuthenticated, isAdmin, statusController.createAction);

/**
 * Update status details
 * PUT '/status/:statusId'
 * request: {
 *  name?: string
 *  minTrust?: number
 * }
 *
 * Send socket update in common channel
 *
 * response: updated status
 * code: 200
 * {
 *  name: string
 *  minTrust: number
 *  actions: [
 *    {
 *      name: string
 *    }
 *  ]
 * }
 *
 * code 401 - not authenticated
 * code 403 - not authorized
 * code 404 - page not found
 * code 422 - validation error
 * code 500 - internal error
 */
router.put('/:statusId', isAuthenticated, isAdmin, statusController.updateStatus);

/**
 * Delete status
 * DELETE '/status/:statusId'
 *
 * Send socket delete in common channel
 *
 * response:
 * code: 200
 *
 * code 401 - not authenticated
 * code 403 - not authorized
 * code 404 - page not found
 * code 500 - internal error
 */
router.delete('/:statusId', isAuthenticated, isAdmin, statusController.deleteStatus);

/**
 * Create status
 * POST '/status'
 * request: {
 *  name: string
 *  minTrust: number
 * }
 *
 * Send socket update in common channel
 *
 * response: updated status
 * code: 201
 * {
 *  name: string
 *  minTrust: number
 *  actions: [
 *    {
 *      name: string
 *    }
 *  ]
 * }
 *
 * code 401 - not authenticated
 * code 403 - not authorized
 * code 422 - validation error
 * code 500 - internal error
 */
router.post('/', isAuthenticated, isAdmin, statusController.createStatus);

/**
 * GET '/status'
 *
 * response:
 * code: 200
 * [
 *  {
 *    name: string
 *    minTrust: number
 *    actions: [
 *      {
 *        name: string
 *      }
 *    ]
 *  }
 * ]
 *
 *
 * code 401 - not authenticated
 * code 500 - internal error
 */
router.get('/', isAuthenticated, statusController.getStatusList);

export default router;