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
