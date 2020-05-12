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
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

import Profile, { IProfile } from '../model/Profile';
import User, { IUser } from '../model/User';
import * as httpErrors from '../util/httpErrors';
import logger from '../util/logger';
import mailSender from '../util/mailSender';
import { initUserSocketNamespace } from '../util/socket';
import { createAuthToken, generateIdentificator } from '../util/utils';
import {
  facebookLoginErrorSchema,
  facebookLoginRequestSchema,
  loginWithEmailPasswordErrorSchema,
  loginWithEmailPasswordRequestSchema,
  registerWithEmailPasswordErrorSchema,
  registerWithEmailPasswordRequestSchema,
  resetPasswordErrorSchema,
  resetPasswordRequestSchema,
  sendResetPasswordEmailErrorSchema,
  sendResetPasswordEmailRequestSchema,
} from '../validators/auth';
import { validateAndConvert } from '../validators/validationError';


export interface AuthTokenPayload {
  userId: string;
  profileId: string;
}

export const registerWithEmailAndPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData = req.body;
    const httpError = validateAndConvert(
      requestData,
      registerWithEmailPasswordRequestSchema,
      registerWithEmailPasswordErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    let newUser: IUser = await User.findOne({ email: requestData.email });
    if (newUser) {
      return next(
        httpErrors.customValidationError(
          'email',
          'User with this email already exists'
        )
      );
    }
    let newProfile: IProfile = new Profile({
      initialized: false,
      identificator: generateIdentificator()
    });
    newProfile = await newProfile.save();

    newUser = new User({
      isAdmin: false,
      email: requestData.email,
      password: requestData.password,
      emailConfirmed: false,
      profile: newProfile._id,
      notificationSettings: {
        notifyNewContact: true,
        notifyTrustUpdate: true
      },
      socketsEnabled: true
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

    try {
      initUserSocketNamespace(newProfile._id.toString());
    } catch (error) {
      logger.info(`Faield to initialize socket namespace for ${newProfile._id.toString()}`)
    }

    const payload: AuthTokenPayload = {
      userId: newUser._id,
      profileId: newProfile._id
    };
    const token = createAuthToken(payload);
    return res.status(201).json({
      token,
      isAdmin: newUser.isAdmin,
      waitingForEmailConfirmation: true,
      notificationSettings: {
        notifyNewContact: newUser.notificationSettings.notifyNewContact,
        notifyTrustUpdate: newUser.notificationSettings.notifyTrustUpdate
      },
      profile: newProfile.toUserProfile(true),
      socketsEnabled: newUser.socketsEnabled == null || newUser.socketsEnabled === true
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
    const httpError = validateAndConvert(
      requestData,
      loginWithEmailPasswordRequestSchema,
      loginWithEmailPasswordErrorSchema
    );
    if (httpError) {
      return next(httpError);
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

    try {
      initUserSocketNamespace(profile._id.toString());
    } catch (error) {
      logger.info(`Faield to initialize socket namespace for ${profile._id.toString()}`)
    }

    const payload: AuthTokenPayload = {
      userId: user._id,
      profileId: profile._id
    };
    const token = createAuthToken(payload);

    let notifyNewContact = true;
    let notifyTrustUpdate = true;
    if (user.notificationSettings) {
      if (user.notificationSettings.notifyTrustUpdate != null) {
        notifyTrustUpdate = user.notificationSettings.notifyTrustUpdate;
      }
      if (user.notificationSettings.notifyNewContact != null) {
        notifyNewContact = user.notificationSettings.notifyNewContact;
      }
    }
    res.status(200).json({
      token,
      isAdmin: user.isAdmin,
      waitingForEmailConfirmation: user.emailConfirmed === false,
      notificationSettings: {
        notifyNewContact,
        notifyTrustUpdate
      },
      profile: profile.toUserProfile(true),
      socketsEnabled: user.socketsEnabled == null || user.socketsEnabled === true
    });
  } catch (error) {
    next(error);
  }
};

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
export const loginWithGoogle = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const idToken = req.body.idToken;
    if (!idToken) {
      return next(
        httpErrors.customValidationError('idToken', 'idToken is required')
      );
    }

    const response = await googleClient.verifyIdToken({
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
          isAdmin: false,
          googleId: email,
          profile: profile._id,
          notificationSettings: {
            notifyNewContact: true,
            notifyTrustUpdate: true
          },
          socketsEnabled: true
        });
        await user.save();
      } else {
        profile = await Profile.findById(user.profile);
      }

      try {
        initUserSocketNamespace(profile._id.toString());
      } catch (error) {
        logger.info(`Faield to initialize socket namespace for ${profile._id.toString()}`)
      }

      const payload: AuthTokenPayload = {
        userId: user._id,
        profileId: profile._id
      };
      const token = createAuthToken(payload);

      let notifyNewContact = true;
      let notifyTrustUpdate = true;
      if (user.notificationSettings) {
        if (user.notificationSettings.notifyTrustUpdate != null) {
          notifyTrustUpdate = user.notificationSettings.notifyTrustUpdate;
        }
        if (user.notificationSettings.notifyNewContact != null) {
          notifyNewContact = user.notificationSettings.notifyNewContact;
        }
      }

      res.status(200).json({
        token,
        isAdmin: user.isAdmin,
        waitingForEmailConfirmation: false,
        notificationSettings: {
          notifyNewContact,
          notifyTrustUpdate
        },
        profile: profile.toUserProfile(true),
        socketsEnabled: user.socketsEnabled == null || user.socketsEnabled === true
      });
    } else {
      return next(httpErrors.notAuthenticatedError('Login with google failed'));
    }
  } catch (error) {
    next(error);
  }
};

export const loginWithFacebook = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData = req.body;
    const httpError = validateAndConvert(
      requestData,
      facebookLoginRequestSchema,
      facebookLoginErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    const fbUrl = `https://graph.facebook.com/${requestData.userId}/?fields=id,name&access_token=${requestData.accessToken}`;
    const authCheckResponse = await fetch(fbUrl);
    const authCheckResponseData = await authCheckResponse.json();

    logger.debug(fbUrl);
    logger.debug(authCheckResponseData);

    let user = await User.findOne({ facebookId: authCheckResponseData.id });
    let profile: IProfile;
    if (!user) {
      profile = new Profile({
        initialized: false,
        username: authCheckResponseData.name,
        identificator: generateIdentificator()
      });
      profile = await profile.save();

      user = new User({
        isAdmin: false,
        facebookId: authCheckResponseData.id,
        profile: profile._id,
        notificationSettings: {
          notifyNewContact: true,
          notifyTrustUpdate: true
        },
        socketsEnabled: true
      });
      await user.save();
    } else {
      profile = await Profile.findById(user.profile);
    }

    try {
      initUserSocketNamespace(profile._id.toString());
    } catch (error) {
      logger.info(`Faield to initialize socket namespace for ${profile._id.toString()}`)
    }

    const payload: AuthTokenPayload = {
      userId: user._id,
      profileId: profile._id
    };
    const token = createAuthToken(payload);

    let notifyNewContact = true;
    let notifyTrustUpdate = true;
    if (user.notificationSettings) {
      if (user.notificationSettings.notifyTrustUpdate != null) {
        notifyTrustUpdate = user.notificationSettings.notifyTrustUpdate;
      }
      if (user.notificationSettings.notifyNewContact != null) {
        notifyNewContact = user.notificationSettings.notifyNewContact;
      }
    }

    res.status(200).json({
      token,
      isAdmin: user.isAdmin,
      waitingForEmailConfirmation: false,
      notificationSettings: {
        notifyNewContact,
        notifyTrustUpdate
      },
      profile: profile.toUserProfile(true),
      socketsEnabled: user.socketsEnabled == null || user.socketsEnabled === true
    });
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

    try {
      initUserSocketNamespace(profile._id.toString());
    } catch (error) {
      logger.info(`Faield to initialize socket namespace for ${profile._id.toString()}`)
    }

    let notifyNewContact = true;
    let notifyTrustUpdate = true;
    if (user.notificationSettings) {
      if (user.notificationSettings.notifyTrustUpdate != null) {
        notifyTrustUpdate = user.notificationSettings.notifyTrustUpdate;
      }
      if (user.notificationSettings.notifyNewContact != null) {
        notifyNewContact = user.notificationSettings.notifyNewContact;
      }
    }

    res.status(200).json({
      isAdmin: user.isAdmin,
      waitingForEmailConfirmation: user.emailConfirmed === false,
      notificationSettings: {
        notifyNewContact,
        notifyTrustUpdate
      },
      profile: profile.toUserProfile(true),
      socketsEnabled: user.socketsEnabled == null || user.socketsEnabled === true
    });
  } catch (error) {
    next(error);
  }
};

const doSendConfirmationEmail = async (userEmail: string, userId: any) => {
  const payload = {
    identificator: generateIdentificator()
  };
  await User.findByIdAndUpdate(userId, {
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
          <p>This link will expire in 3 hours. You can request a new activation link from the application.</p>
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
        httpErrors.customValidationError(
          'confirmationToken',
          'confirmationToken is required'
        )
      );
    }

    const user: IUser = await User.findById(req.userId);
    if (user.email != null && user.emailConfirmed === false) {
      const decodedToken: any = jwt.verify(
        confirmationToken,
        process.env.CONFIRMATION_TOKEN_SECRET
      );
      const confirmationIdentificator = decodedToken.identificator;
      if (confirmationIdentificator !== user.confirmationIdentificator) {
        return next(
          httpErrors.customValidationError(
            'confirmationToken',
            'token is invalid'
          )
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
    const httpError = validateAndConvert(
      req.body,
      sendResetPasswordEmailRequestSchema,
      sendResetPasswordEmailErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    const email = req.body.email;
    const user: IUser = await User.findOne({ email });
    if (!user) {
      return next(
        httpErrors.customValidationError(
          'email',
          'User with this email does not exist.'
        )
      );
    }

    const passwordResetIdentificator = generateIdentificator();

    const payload = {
      passwordResetIdentificator
    };

    user.passwordResetIdentificator = passwordResetIdentificator;
    await user.save();

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
            <p>This link will expire in 3 hours. You can request a new link from the application.</p>
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

export const resetPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData = req.body;
    const httpError = validateAndConvert(
      requestData,
      resetPasswordRequestSchema,
      resetPasswordErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    const decodedToken: any = jwt.verify(
      requestData.resetPasswordToken,
      process.env.PASSWORD_RESET_SECRET
    );
    const passwordResetIdentificator = decodedToken.passwordResetIdentificator;
    const user: IUser = await User.findOne({ passwordResetIdentificator });
    if (!user) {
      return next(
        httpErrors.customValidationError(
          'resetPasswordToken',
          'token is invalid'
        )
      );
    }
    user.password = requestData.password;
    user.passwordResetIdentificator = null;
    await user.save();

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
