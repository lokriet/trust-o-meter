export enum ContactSideStatus {
  WantToLink = 'WantToLink', // requested/approved
  DontWantToLink = 'DontWantToLink', // request denied/withdrawn
  Deleted = 'Deleted' // link wath there and then was broken
}

export interface ContactSide {
  _id: any;
  linkId: string;
  ownerId: string | null;
  otherSideIdentificator: string;
  status: ContactSideStatus;
  trustPoints: number | null;
  customName: string | null;
}