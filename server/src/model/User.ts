import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import bcrypt from 'bcrypt-nodejs';

const UserSchema = new Schema({
  username: {
        type: String,
        unique: true,
        required: true
    },
  password: {
        type: String,
        required: true
    }
});

UserSchema.pre('save', function (next) {
    const user: any = this;
    if (this.isModified('password') || this.isNew) {
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

UserSchema.methods.comparePassword = function(passw: any, cb: any) {
    bcrypt.compare(passw, this.password, (err, isMatch) => {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

const User = mongoose.model('User', UserSchema);
export default User;