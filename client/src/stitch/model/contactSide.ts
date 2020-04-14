import { Profile } from '../../store/model/profile';

export enum ContactSideStatus {
  WantToLink = 'WantToLink', // requested/approved
  DontWantToLink = 'DontWantToLink', // request denied/withdrawn
  Deleted = 'Deleted' // link wath there and then was broken
}

export interface ContactSide {
  _id: any;
  linkId: string;
  ownerId: string | null;
  ownerProfileId: any;
  otherSideProfileId: any;
  status: ContactSideStatus;
  trustPoints: number | null;
  customName: string | null;

  otherSideProfile: Partial<Profile>;
  ownerProfile: Partial<Profile>;
}