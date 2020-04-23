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

export const resetPasswordRequestSchema = Joi.object().keys({
  email: Joi.string().email().required()
});