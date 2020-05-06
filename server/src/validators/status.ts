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


export const createStatusRequestSchema = Joi.object().keys({
  name: Joi.string().required(),
  minTrust: Joi.number().min(0).required()
});


export const createStatusErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'name',
    errorMessage: 'Name is required'
  },
  {
    fieldName: 'minTrust',
    errorMessage: 'Minimal trust value is required'
  }
];
export const updateStatusRequestSchema = Joi.object().keys({
  name: Joi.string().optional(),
  minTrust: Joi.number().min(0).optional()
});


export const updateStatusErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'minTrust',
    errorMessage: "Minimal trust value can't be negative"
  }
];
