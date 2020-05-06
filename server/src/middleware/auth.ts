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
import * as httpErrors from '../util/httpErrors';


const isAuthenticated = async (req: any, res: any, next: any) => {
  const header = req.get('Authorization');
  if (!header) {
    throw httpErrors.notAuthenticatedError();
  }
  const token = header.split(' ')[1]; // value after 'Bearer '
  if (!token) {
    throw httpErrors.notAuthenticatedError();
  }
  try {
    const decodedToken: AuthTokenPayload = jwt.verify(token, process.env.AUTH_TOKEN_SECRET) as AuthTokenPayload;
    req.userId = decodedToken.userId;
    req.profileId = decodedToken.profileId;
  } catch (err) {
    next(httpErrors.notAuthenticatedError());
  }

  next();
}

export default isAuthenticated;