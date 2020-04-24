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