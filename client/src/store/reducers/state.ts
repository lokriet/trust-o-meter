import { AuthState } from './auth';
import { ProfileState } from './profile';
import { ContactsState } from './contacts';
import { StatusState } from './status';

export interface State {
  auth: AuthState;
  profile: ProfileState;
  contacts: ContactsState;
  status: StatusState;
}