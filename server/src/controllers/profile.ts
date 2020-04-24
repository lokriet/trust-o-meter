import { NextFunction, Response } from 'express';

import Profile, { IProfile } from '../model/Profile';
import User, { IUser } from '../model/User';
import { validateAndConvert } from '../validators/validationError';
import { updateProfileRequestSchema, updateProfileErrorSchema } from '../validators/profile';
import _ from 'lodash';
import logger from '../util/logger';

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