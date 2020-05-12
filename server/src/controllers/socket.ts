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
import { NextFunction, Response } from 'express';

import User, { IUser } from '../model/User';
import * as httpErrors from '../util/httpErrors';


export const updateSocketEnabled = async (req: any, res: Response, next: NextFunction) => {
  try {
    const enabled = req.body.enabled;
    if (enabled == null || typeof enabled !== "boolean") {
      return next(httpErrors.customValidationError("enabled", "Enabled parameter is required"));
    }

    const user: IUser = await User.findById(req.userId);
    user.socketsEnabled = enabled;
    await user.save();

    res.status(200).send();
  } catch (error) {
    next(error);
  }
}