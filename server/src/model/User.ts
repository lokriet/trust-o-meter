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
import bcrypt from 'bcrypt-nodejs';
import { Document, model, Schema, Types } from 'mongoose';

import Profile, { IProfile } from './Profile';

const NotificationSettingsSchema = new Schema({
  notifyTrustUpdate: {
    type: Boolean
  },
  notifyNewContact: {
    type: Boolean
  },
  subscriptions: [{
    type: Object
  }]
});

const UserSchema = new Schema({
  isAdmin: {
    type: Boolean,
    required: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true
  },
  password: {
    type: String
  },
  confirmationIdentificator: {
    type: String
  },
  emailConfirmed: {
    type: Boolean
  },
  passwordResetIdentificator: {
    type: String
  },

  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  facebookId: {
    type: String,
    unique: true,
    sparse: true
  },

  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },

  notificationSettings: {
    type: NotificationSettingsSchema
  }
});

UserSchema.methods.comparePassword = function (passw: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
      bcrypt.compare(passw, this.password, (err, isMatch) => {
          if (err) {
              reject(err);
          } else {
              resolve(isMatch);
          }
      })
  });
};

export interface INotificationSettings extends Document {
  notifyTrustUpdate?: boolean;
  notifyNewContact?: boolean;
  subscriptions: Types.Array<object>;
}

interface IUserSchema extends Document {
  isAdmin: boolean;

  email?: string;
  password?: string;
  emailConfirmed?: boolean;
  confirmationIdentificator?: string;
  passwordResetIdentificator?: string;

  googleId?: string;
  facebookId?: string;

  notificationSettings?: INotificationSettings;
}

interface IUserBase extends IUserSchema {
  comparePassword(passwd: string): Promise<boolean>;
}

export interface IUser extends IUserBase {
  profile: IProfile['_id'];
}

export interface IUserPopulated extends IUserBase {
  profile: IProfile;
}

UserSchema.pre<IUser>('save', function (next) {
  const user: IUser = this;
  if (this.isModified('password') || (this.isNew && this.password != null)) {
    bcrypt.genSalt(10, (saltError, salt) => {
      if (saltError) {
        return next(saltError);
      }
      bcrypt.hash(user.password, salt, null, (hashError, hash) => {
        if (hashError) {
          return next(hashError);
        }
        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

UserSchema.pre<IUser>('remove', function (next) {
  const user: IUser = this;
  Profile.findByIdAndDelete(user.profile).exec();
  next();
});

export const NotificationSettings = model<INotificationSettings>('NotificationSettings', NotificationSettingsSchema);
const User = model<IUser>('User', UserSchema);
export default User;
