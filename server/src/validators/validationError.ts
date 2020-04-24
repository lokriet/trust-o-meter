import Joi from '@hapi/joi';
import { HttpError } from '../util/httpErrors';
import * as httpErrors from '../util/httpErrors';

export interface ServerValidationError {
  fieldName?: string;
  errorMessage: string;
}

export const validateAndConvert = (dataToValidate: any, validationSchema: Joi.Schema, errorsSchema: ServerValidationError[]): HttpError | null => {
  const validationResult = validationSchema.validate(dataToValidate, {abortEarly: false});
  if (validationResult.error) {
    return httpErrors.validationError(convertError(validationResult.error, errorsSchema));
  } else {
    return null;
  }
}

export const convertError = (error: Joi.ValidationError, serverErrorsSchema: ServerValidationError[]): ServerValidationError[] => {
  const serverErrors = new Set<ServerValidationError>();

  error.details.forEach(item => {
    const serverError = serverErrorsSchema.find(errorSchemaItem => errorSchemaItem.fieldName === item.context.label);
    if (serverError != null) {
      serverErrors.add(serverError);
    }
  });

  if (serverErrors.size > 0) {
    return Array.from(serverErrors);
  } else {
    return null;
  }
};
