import { Profile } from './profile';

export enum ContactStatus {
  IncomingRequest = 'IncomingRequest',
  OutgoingRequest = 'OutgoingRequest',
  Connected = 'Connected',
  RequestDenied = 'RequestDenied',
  ContactDeleted = 'ContactDeleted'
};

export interface Contact {
  status: ContactStatus;
  contactProfile: Partial<Profile>;
  myCustomName: string | null;
  contactCustomName: string | null;
  myTrustPoints: number;
  contactTrustPoints: number;
}