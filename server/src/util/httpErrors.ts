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
import { ServerValidationError, singleValidationError } from '../validators/validationError';
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

export const customValidationError = (fieldName: string, errorMessage: string): HttpError => {
  return validationError(singleValidationError(fieldName, errorMessage));
}
