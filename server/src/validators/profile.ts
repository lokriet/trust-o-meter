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


export const updateProfileRequestSchema = Joi.object().keys({
  username: Joi.string().optional(),
  avatarUrl: Joi.string().uri().allow(null, '').optional(),
  gender: Joi.string().valid('F', 'M', 'O')
});

export const updateProfileErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'username',
    errorMessage: 'Name should not be empty',
  },
  {
    fieldName: 'avatarUrl',
    errorMessage: 'Avatar url is incorrect',
  },
  {
    fieldName: 'gender',
    errorMessage: 'Gender is incorrect',
  }
];