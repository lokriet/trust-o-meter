import express from 'express';
// import passport from 'passport';

import User, { IUser } from '../model/User';

const router = express.Router();

router.get('/', /*passport.authenticate('jwt', { session: false}), */async (req: any, res: any, next: any) => {
  try {
    const user: IUser = await User.findById(req.user.id);
    if (!user) {
      res.status(401).json({msg: 'Authentication failed'});
    }
    res.status(200).json({
      // identificator: user.identificator,
      // initialized: user.initialized,
      // username: user.username,
      // avatarUrl: user.avatarUrl,
      // gender: user.gender
    });
  } catch (error) {
    next(error);
  }
});

export default router;