import Joi from '@hapi/joi';

import { ServerValidationError } from './validationError';

export const updateContactCustomNameRequestSchema = Joi.object().keys({
  identificator: Joi.string().required(),
  customName: Joi.string().allow(null, '').required()
});

export const updateContactCustomNameErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'identificator',
    errorMessage: 'Contact identificator is required'
  },
  {
    fieldName: 'customName',
    errorMessage: 'New name value is required'
  }
];

export const updateContactTrustRequestSchema = Joi.object().keys({
  identificator: Joi.string().required(),
  increase: Joi.boolean().required()
});

export const updateContactTrustErrorSchema: ServerValidationError[] = [
  {
    fieldName: 'identificator',
    errorMessage: 'Contact identificator is required'
  },
  {
    fieldName: 'increase',
    errorMessage: 'Increase flag is required'
  }
];
