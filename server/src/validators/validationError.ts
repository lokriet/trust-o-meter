import Joi from '@hapi/joi';

export interface ServerValidationError {
  fieldName?: string;
  errorMessage: string;
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
