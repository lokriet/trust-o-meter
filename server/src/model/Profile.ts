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
import { Document, model, Schema } from 'mongoose';


export enum Gender {
  Male = 'M',
  Female = 'F',
  Other = 'O'
}

const ProfileSchema = new Schema({
  initialized: {
    type: Boolean,
    required: true
  },
  identificator: {
    type: String,
    unique: true,
    required: true
  },
  username: {
    type: String
  },
  avatarUrl: {
    type: String
  },
  gender: {
    type: String,
    enum: [Gender.Female, Gender.Male, Gender.Other]
  }
});

ProfileSchema.methods.toUserProfile = function(isOwnProfile: boolean): any {
  const result: any = {
    identificator: this.identificator
  };
  if (isOwnProfile) {
    result.initialized = this.initialized;
    result._id = this._id.toString();
  };
  if (this.username) {
    result.username = this.username;
  }
  if (this.gender) {
    result.gender = this.gender;
  }
  if (this.avatarUrl) {
    result.avatarUrl = this.avatarUrl;
  }

  return result;
}

interface IProfileSchema extends Document {
  initialized: boolean;
  identificator: string;
  username?: string;
  avatarUrl?: string;
  gender?: Gender;
};


export interface IProfile extends IProfileSchema {
  toUserProfile(isOwnProfile: boolean): any;
}

const Profile = model<IProfile>('Profile', ProfileSchema);
export default Profile;