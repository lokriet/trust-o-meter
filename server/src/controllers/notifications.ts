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
import logger from '../util/logger';

import User from '../model/User';
import * as httpErrors from '../util/httpErrors';
import { updateNotificationSettingsRequestSchema } from '../validators/notifications';

export const addNotificationsSubscription = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscription = req.body;

    if (!subscription) {
      next(
        httpErrors.customValidationError(
          'subscription',
          'Subscription settings are required'
        )
      );
    }

    const user = await User.findById(req.userId);
    if (
      !user.notificationSettings ||
      !user.notificationSettings.subscriptions.some(
        (subscriptionItem: any) =>
          subscriptionItem.endpoint === subscription.endpoint
      )
    ) {
      logger.debug(subscription);
      await User.findByIdAndUpdate(req.userId, {
        $push: { 'notificationSettings.subscriptions': subscription }
      });
    }

    return res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettings = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = req.body;
    const validationResult = updateNotificationSettingsRequestSchema.validate(
      settings
    );
    if (validationResult.error) {
      next(
        httpErrors.customValidationError(
          'settings',
          'Settings should include either notifyTrustUpdate or notifyNewContact'
        )
      );
    }

    const settingsUpdate: any = {
      $set: {}
    };
    if (settings.notifyTrustUpdate != null) {
      // tslint:disable-next-line: no-string-literal
      settingsUpdate['$set']['notificationSettings.notifyTrustUpdate'] =
        settings.notifyTrustUpdate;
    }
    if (settings.notifyNewContact != null) {
      // tslint:disable-next-line: no-string-literal
      settingsUpdate['$set']['notificationSettings.notifyNewContact'] =
        settings.notifyNewContact;
    }

    await User.findByIdAndUpdate(req.userId, settingsUpdate);

    return res.status(200).send();
  } catch (error) {
    next(error);
  }
};
