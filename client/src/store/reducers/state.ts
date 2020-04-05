import { AuthState } from './auth';
import { ProfileState } from './profile';
import { ContactsState } from './contacts';

export interface State {
  auth: AuthState;
  profile: ProfileState;
  contacts: ContactsState;
}