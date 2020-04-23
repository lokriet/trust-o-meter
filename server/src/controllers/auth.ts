import { NextFunction, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

import Profile, { IProfile } from '../model/Profile';
import User, { IUser } from '../model/User';
import * as httpErrors from '../util/httpErrors';
import logger from '../util/logger';
import mailSender from '../util/mailSender';
import { createAuthToken, generateIdentificator } from '../util/utils';
import {
  loginWithEmailPasswordErrorSchema,
  loginWithEmailPasswordRequestSchema,
  registerWithEmailPasswordErrorSchema,
  registerWithEmailPasswordRequestSchema,
  resetPasswordRequestSchema
} from '../validators/auth';
import { convertError } from '../validators/validationError';

export interface AuthTokenPayload {
  userId: string;
}

export const registerWithEmailAndPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData = req.body;
    const response = registerWithEmailPasswordRequestSchema.validate(
      requestData,
      {
        abortEarly: false
      }
    );

    if (response.error) {
      return next(
        httpErrors.validationError(
          convertError(response.error, registerWithEmailPasswordErrorSchema)
        )
      );
    }

    let newUser: IUser = await User.findOne({ email: requestData.email });
    if (newUser) {
      return next(
        httpErrors.validationError([
          {
            fieldName: 'email',
            errorMessage: 'User with this email already exists'
          }
        ])
      );
    }
    let newProfile: IProfile = new Profile({
      initialized: false,
      identificator: generateIdentificator()
    });
    newProfile = await newProfile.save();

    newUser = new User({
      email: requestData.email,
      password: requestData.password,
      emailConfirmed: false,
      profile: newProfile._id
    });

    newUser = await newUser.save();

    try {
      await doSendConfirmationEmail(requestData.email, newUser._id);
    } catch (error) {
      logger.info(error);
      logger.debug(`deleting user ${newUser._id}`);
      await newUser.remove();
      throw new Error('Failed to send activation email');
    }

    const payload: AuthTokenPayload = {
      userId: newUser._id
    };
    const token = createAuthToken(payload);
    return res.status(201).json({
      token,
      waitingForEmailConfirmation: true,
      profile: newProfile.toUserProfile(true)
    });
  } catch (error) {
    next(error);
  }
};

export const loginWithEmailAndPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData = req.body;
    const response = loginWithEmailPasswordRequestSchema.validate(requestData, {
      abortEarly: false
    });

    if (response.error) {
      return next(
        httpErrors.validationError(
          convertError(response.error, loginWithEmailPasswordErrorSchema)
        )
      );
    }

    const user: IUser = await User.findOne({ email: requestData.email });
    if (!user) {
      return next(
        httpErrors.notAuthenticatedError('Wrong username or password')
      );
    }

    const passwordsMatch = await user.comparePassword(requestData.password);
    if (!passwordsMatch) {
      return next(
        httpErrors.notAuthenticatedError('Wrong username or password')
      );
    }

    const profile: IProfile = await Profile.findById(user.profile);

    const payload: AuthTokenPayload = {
      userId: user._id
    };
    const token = createAuthToken(payload);
    res.status(200).json({
      token,
      waitingForEmailConfirmation: user.emailConfirmed === false,
      profile: profile.toUserProfile(true)
    });
  } catch (error) {
    next(error);
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const loginWithGoogle = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return next(
        httpErrors.validationError([
          {
            fieldName: 'idToken',
            errorMessage: 'idToken is required'
          }
        ])
      );
    }

    const response = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const { email_verified, name, email } = response.getPayload();
    if (email_verified) {
      let user = await User.findOne({ googleId: email });
      let profile: IProfile;
      if (!user) {
        profile = new Profile({
          initialized: false,
          username: name,
          identificator: generateIdentificator()
        });
        profile = await profile.save();

        user = new User({
          googleId: email,
          profile: profile._id
        });
        await user.save();
      } else {
        profile = await Profile.findById(user.profile);
      }

      const payload: AuthTokenPayload = {
        userId: user._id
      };

      const token = createAuthToken(payload);
      res.status(200).json({
        token,
        waitingForEmailConfirmation: false,
        profile: profile.toUserProfile(true)
      });
    } else {
      return next(httpErrors.notAuthenticatedError('Login with google failed'));
    }
  } catch (error) {
    next(error);
  }
};

export const getAuthDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: IUser = await User.findById(req.userId);
    const profile: IProfile = await Profile.findById(user.profile);

    res.status(200).json({
      waitingForEmailConfirmation: user.emailConfirmed === false,
      profile: profile.toUserProfile(true)
    });
  } catch (error) {
    next(error);
  }
};

const doSendConfirmationEmail = (userEmail: string, userId: any) => {
  const payload = {
    identificator: generateIdentificator()
  };
  User.findByIdAndUpdate(userId, {
    confirmationIdentificator: payload.identificator
  });
  const mailToken = jwt.sign(payload, process.env.CONFIRMATION_TOKEN_SECRET, {
    expiresIn: '3h'
  });

  const emailData = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO || userEmail,
    subject: `Account activation link`,
    html: `
          <h1>Please use the following link to activate your account</h1>
          <p>${process.env.CLIENT_URL}/activateAccount/${mailToken}</p>
          <p>This link will expire in 3 hours. You can re-send a new activation link from the application.</p>
          <hr />
          <p>This email may contain sensetive information</p>
          <p>${process.env.CLIENT_URL}</p>
      `
  };
  return mailSender.send(emailData);
};

export const sendConfirmationEmail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user: IUser = await User.findById(req.userId);
    if (user.email != null && user.emailConfirmed === false) {
      await doSendConfirmationEmail(user.email, user._id);
    }
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const confirmEmail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const confirmationToken = req.body.confirmationToken;
    if (!confirmationToken) {
      return next(
        httpErrors.validationError([
          {
            fieldName: 'confirmationToken',
            errorMessage: 'confirmationToken is required'
          }
        ])
      );
    }

    const user: IUser = await User.findById(req.userId);
    if (user.email != null && user.emailConfirmed === false) {
      const decodedToken: any = jwt.verify(
        confirmationToken,
        process.env.CONFIRMATION_TOKEN_SECRET
      );
      const confirmationIdentificator = decodedToken.confirmationIdentificator;
      if (confirmationIdentificator !== user.confirmationIdentificator) {
        return next(
          httpErrors.validationError([
            {
              fieldName: 'confirmationToken',
              errorMessage: 'token is invalid'
            }
          ])
        );
      } else {
        user.confirmationIdentificator = null;
        user.emailConfirmed = true;
        await user.save();
        res.status(200).send();
      }
    }
  } catch (error) {
    next(error);
  }
};

export const sendPasswordResetEmail = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = resetPasswordRequestSchema.validate(req.body);
    if (response.error) {
      return next(
        httpErrors.validationError([
          {
            fieldName: 'email',
            errorMessage: 'Please enter a correct email.'
          }
        ])
      );
    }

    const email = req.body.email;
    const user: IUser = await User.findOne({ email });
    if (!user) {
      return next(
        httpErrors.validationError([
          {
            fieldName: 'email',
            errorMessage: 'User with this email does not exist.'
          }
        ])
      );
    }

    const passwordResetIdentificator = generateIdentificator();

    const payload = {
      passwordResetIdentificator
    };

    User.findByIdAndUpdate(user._id, {
      passwordResetIdentificator
    });

    const mailToken = jwt.sign(payload, process.env.PASSWORD_RESET_SECRET, {
      expiresIn: '3h'
    });

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO || user.email,
      subject: `Reset password link`,
      html: `
            <h1>Please use the following link to reset your password</h1>
            <p>${process.env.CLIENT_URL}/resetPassword/${mailToken}</p>
            <p>This link will expire in 3 hours. You can re-send a new link from the application.</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>${process.env.CLIENT_URL}</p>
        `
    };
    await mailSender.send(emailData);

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

