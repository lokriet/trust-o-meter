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


export const registerWithEmailPasswordRequestSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(200).required(),
});

export const registerWithEmailPasswordErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'email',
    errorMessage: 'Email is invalid',
  },
  {
    fieldName: 'password',
    errorMessage: 'Password should be a string between 6 and 200 symbols long',
  },
];

export const loginWithEmailPasswordRequestSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const loginWithEmailPasswordErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'email',
    errorMessage: 'Email is required',
  },
  {
    fieldName: 'password',
    errorMessage: 'Password is required',
  },
];

export const sendResetPasswordEmailRequestSchema = Joi.object().keys({
  email: Joi.string().email().required()
});

export const sendResetPasswordEmailErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'email',
    errorMessage: 'Please enter a correct email.',
  }
];

export const resetPasswordRequestSchema = Joi.object().keys({
  password: Joi.string().min(6).max(200).required(),
  resetPasswordToken: Joi.string().required()
});

export const resetPasswordErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'password',
    errorMessage: 'Password should be a string between 6 and 200 symbols long',
  },
  {
    fieldName: 'resetPasswordToken',
    errorMessage: 'Reset token is required',
  },
];

export const facebookLoginRequestSchema = Joi.object().keys({
  userId: Joi.string().required(),
  accessToken: Joi.string().required()
});

export const facebookLoginErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'userId',
    errorMessage: 'UserId is required',
  },
  {
    fieldName: 'accessToken',
    errorMessage: 'Access token is required',
  },
];

