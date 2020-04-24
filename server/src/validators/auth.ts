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

