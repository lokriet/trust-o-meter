import bcrypt from 'bcrypt-nodejs';
import { Document, model, Schema } from 'mongoose';

import Profile, { IProfile } from './Profile';

const UserSchema = new Schema({
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

  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
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

interface IUserSchema extends Document {
  email?: string;
  password?: string;
  emailConfirmed?: boolean;
  confirmationIdentificator?: string;
  passwordResetIdentificator?: string;

  googleId?: string;
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

const User = model<IUser>('User', UserSchema);
export default User;
