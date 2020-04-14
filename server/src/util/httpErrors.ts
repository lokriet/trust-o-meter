import * as responseCodes from './responseCodes';

export class HttpError extends Error {
  statusCode: number;
  responseCode: string;
  data: any;
}

export const pageNotFoundError = () => {
  const error = new HttpError('Page not found');
  error.statusCode = 404;
  error.responseCode = responseCodes.PAGE_NOT_FOUND;
  return error;
};

export const notAuthenticatedError = (message: string) => {
  const error = new HttpError(message || 'Authentication failed');
  error.statusCode = 401;
  error.responseCode = responseCodes.AUTHENTICATION_FAILED;
  return error;
}


export const notAuthorizedError = () => {
  const error = new HttpError('Not Authorized');
  error.statusCode = 403;
  error.responseCode = responseCodes.NOT_AUTHORIZED;
  return error;
}

export const validationError = (errorData: any) => {
  const error = new HttpError('Validation failed');
  error.statusCode = 422;
  error.responseCode = responseCodes.VALIDATION_ERROR;
  error.data = errorData
  return error;
}

export const joiValidationError = (errorData: any) => {
  const error = new HttpError('Validation failed');
  error.statusCode = 422;
  error.responseCode = responseCodes.VALIDATION_ERROR;
  error.data = errorData
  return error;
}
