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
import Joi from '@hapi/joi';

import { ServerValidationError } from './validationError';


export const updateContactCustomNameRequestSchema = Joi.object().keys({
  customName: Joi.string().allow(null, '').required()
});

export const updateContactCustomNameErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'customName',
    errorMessage: 'New name value is required'
  }
];

export const updateContactTrustRequestSchema = Joi.object().keys({
  increase: Joi.boolean().required()
});

export const updateContactTrustErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'increase',
    errorMessage: 'Increase flag is required'
  }
];

export const changeActionStateRequestSchema = Joi.object().keys({
  statusId: Joi.string().required(),
  actionId: Joi.string().required(),
  actionDone: Joi.boolean().required()
});

export const changeActionStateErrorSchema: ServerValidationError[] = [{
    fieldName: 'statusId',
    errorMessage: 'Status identificator is required'
  },
  {
    fieldName: 'actionId',
    errorMessage: 'Action identificator is required'
  },
  {
    fieldName: 'actionDone',
    errorMessage: 'Action done flag is required'
  }
];
