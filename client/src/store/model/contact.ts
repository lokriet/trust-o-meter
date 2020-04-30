import { Profile } from './profile';

export enum ContactStatus {
  // IncomingRequest = 'IncomingRequest',
  // OutgoingRequest = 'OutgoingRequest',
  // Connected = 'Connected',
  // RequestDenied = 'RequestDenied',
  // ContactDeleted = 'ContactDeleted'
  IncomingRequest = 'IncomingRequest',
  OutgoingRequest = 'OutgoingRequest',
  Connected = 'Connected',
  RequestDenied = 'OutgoingRequestDeniedUnseenByMe',
  ContactDeleted = 'ContactDeletedUnseenByMe'
};

export interface Contact {
  status: ContactStatus;
  contactProfile: Profile;
  myCustomName: string | null;
  contactCustomName: string | null;
  myTrustPoints: number;
  contactTrustPoints: number;
}

export interface ContactUpdate {
  customName?: string | null;
  trustPoints?: number;
}