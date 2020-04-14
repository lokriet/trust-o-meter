import passport from 'passport';
import settings from '../config/settings';
import passportFunc from '../config/passport';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../model/User';

passportFunc(passport);
const router = express.Router();

router.post('/register', async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.json({ success: false, msg: 'Please pass username and password.' });
  } else {
    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
    });

    try {
      await newUser.save();
      res.json({ success: true, msg: 'Successful created new user.' });
    } catch (err) {
      // TODO
      return res.json({ success: false, msg: 'Username already exists.' });
    }
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const user: any = await User.findOne({
      username: req.body.username,
    });
    if (!user) {
      res.status(401).send({ success: false, msg: 'Authentication failed' });
    } else {
      try {
        const isMatch = await user.comparePassword(req.body.password);
        if (isMatch) {
          const token = jwt.sign(user.toJSON(), settings.secret);
          // TODO
          res.json({ success: true, token });
        } else {
          res
            .status(401)
            .send({ success: false, msg: 'Authentication failed' });
        }
      } catch (matchError) {
        res.status(401).send({ success: false, msg: 'Authentication failed' });
      }
    }
  } catch (dbError) {
    // TODO
    next(dbError);
  }
});

export default router;
