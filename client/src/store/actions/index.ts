export {
  checkInitialAuthState,
  authInit,
  setAuthRedirectPath,
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  loginWithGoogle,
  loginWithFacebook,
  logout,
  sendConfirmationEmail,
  confirmEmail,
  requestPasswordReset,
  resetPassword
} from './auth';

export {
  setProfile,
  updateProfile,
  resetProfileStore
} from './profile';

export {
  fetchUserContacts,

  searchContacts,
  contactsOperationReset,
  createContactRequest,
  resetContactsStore
} from './contacts';