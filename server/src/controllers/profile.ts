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
import _ from 'lodash';

import Profile, { IProfile } from '../model/Profile';
import User, { IUser } from '../model/User';
import logger from '../util/logger';
import { updateProfileErrorSchema, updateProfileRequestSchema } from '../validators/profile';
import { validateAndConvert } from '../validators/validationError';


export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const profileUpdate = req.body;
    const httpError = validateAndConvert(profileUpdate, updateProfileRequestSchema, updateProfileErrorSchema);
    if (httpError) {
      return next(httpError);
    }

    const user: IUser = await User.findById(req.userId);
    let profile: IProfile = await Profile.findById(user.profile);
    _.assign(profile, profileUpdate);
    profile.initialized = true;
    profile = await profile.save();

    res.status(200).json(profile.toUserProfile(true));
  } catch (error) {
    next(error);
  }
}