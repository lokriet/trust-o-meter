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
import Joi from '@hapi/joi';

import { HttpError } from '../util/httpErrors';
import * as httpErrors from '../util/httpErrors';


export interface ServerValidationError {
  fieldName?: string;
  errorMessage: string;
}

export const singleValidationError = (fieldName: string, errorMessage: string): ServerValidationError[] => {
  return [{fieldName, errorMessage}];
};

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
