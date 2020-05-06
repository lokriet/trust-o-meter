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

router.put('/:statusId/actions/:actionId', isAuthenticated, isAdmin, statusController.updateAction);
router.delete('/:statusId/actions/:actionId', isAuthenticated, isAdmin, statusController.deleteAction);
router.post('/:statusId/actions', isAuthenticated, isAdmin, statusController.createAction);

router.put('/:statusId', isAuthenticated, isAdmin, statusController.updateStatus);
router.delete('/:statusId', isAuthenticated, isAdmin, statusController.deleteStatus);
router.post('/', isAuthenticated, isAdmin, statusController.createStatus);

router.get('/', isAuthenticated, statusController.getStatusList);

export default router;