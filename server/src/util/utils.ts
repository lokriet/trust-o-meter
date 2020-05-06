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
import jwt from 'jsonwebtoken';

import { AuthTokenPayload } from '../controllers/auth';



export const generateIdentificator = (): string => {
  const result = (Date.now() + Math.floor(Math.random() * 8000000000)).toString(36);
  return result;
};

export const createAuthToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, process.env.AUTH_TOKEN_SECRET);
}