import { ServerValidationError } from '../validators/validationError';
import * as responseCodes from './responseCodes';

export class HttpError extends Error {
  statusCode: number;
  responseCode: string;
  data: any;
}

export const pageNotFoundError = (): HttpError => {
  const error = new HttpError('Page not found');
  error.statusCode = 404;
  error.responseCode = responseCodes.PAGE_NOT_FOUND;
  return error;
};

export const notAuthenticatedError = (message?: string): HttpError => {
  const error = new HttpError(message || 'Authentication failed');
  error.statusCode = 401;
  error.responseCode = responseCodes.AUTHENTICATION_FAILED;
  return error;
};

export const notAuthorizedError = (): HttpError => {
  const error = new HttpError('Not Authorized');
  error.statusCode = 403;
  error.responseCode = responseCodes.NOT_AUTHORIZED;
  return error;
};

export const validationError = (
  errorData: ServerValidationError[]
): HttpError => {
  const error = new HttpError('Validation failed');
  error.statusCode = 422;
  error.responseCode = responseCodes.VALIDATION_ERROR;
  error.data = errorData;
  return error;
};
