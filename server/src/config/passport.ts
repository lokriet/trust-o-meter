import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import User from '../model/User';
import settings from './settings';

const passportFunc = (passport: any) => {
  const opts: any = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  opts.secretOrKey = settings.secret;
  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const user = await User.findOne({ _id: jwtPayload.id });
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (error) {
        return done(error, false);
      }
    })
  );
};

export default passportFunc;
