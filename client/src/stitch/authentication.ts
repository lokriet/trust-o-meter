import {
  AnonymousCredential,
  StitchUser,
  UserPasswordCredential,
  UserPasswordAuthProviderClient
} from 'mongodb-stitch-browser-sdk';

import { app } from './app';

export const loginAnonymous = (): Promise<StitchUser> => {
  const credential = new AnonymousCredential();
  return app.auth.loginWithCredential(credential);
};

export const registerWithEmailPassword = async (
  email: string,
  password: string
): Promise<StitchUser> => {
  const emailPasswordClient = app.auth.getProviderClient(
    UserPasswordAuthProviderClient.factory
  );
  await emailPasswordClient.registerWithEmail(email, password);
  return loginWithEmailPassword(email, password);
};

export const loginWithEmailPassword = (
  email: string,
  password: string
): Promise<StitchUser> => {
  const credential = new UserPasswordCredential(email, password);
  return app.auth.loginWithCredential(credential);
};

export const hasLoggedInUser = (): boolean => {
  return app.auth.isLoggedIn;
};

export const getCurrentUser = (): StitchUser | null | undefined => {
  return app.auth.isLoggedIn ? app.auth.user : null;
};

export const logoutCurrentUser = (): Promise<void> | void => {
  const user = getCurrentUser();
  if (user) {
    return app.auth.logoutUserWithId(user.id);
  } else {
    return;
  }
};
