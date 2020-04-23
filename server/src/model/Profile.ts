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