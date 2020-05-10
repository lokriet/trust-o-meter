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

import User, { INotificationSettings, NotificationSettings } from '../model/User';

export const updateNotificationsSubscription = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const subscription = req.body;

    const user = await User.findById(req.userId);
    if (
      !user.notificationSettings ||
      !user.notificationSettings.some(
        (notificationSettingsItem) =>
          notificationSettingsItem.subscription.endpoint ===
          subscription.endpoint
      )
    ) {
      await User.findByIdAndUpdate(req.userId, {
        $push: { notificationSettings: { subscription } }
      });
    }

    return res.status(200).send();
  } catch (error) {
    next(error);
  }
};
