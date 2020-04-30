import { Document, model, Schema, Types } from 'mongoose';

import Profile, { IProfile } from './Profile';

export enum ContactSideStatus {
  Pending = 'Pending',
  WantToConnect = 'WantToConnect',
  DontWantToConnect = 'DontWantToConnect',
  Deleted = 'Deleted'
}

export enum ContactStatus {
  // shown in the list
  IncomingRequest = 'IncomingRequest',
  OutgoingRequest = 'OutgoingRequest',
  Connected = 'Connected',
  OutgoingRequestDeniedUnseenByMe = 'OutgoingRequestDeniedUnseenByMe',
  ContactDeletedUnseenByMe = 'ContactDeletedUnseenByMe',

  // unshown in the list
  CancelledIncomingRequest = 'CancelledIncomingRequest',
  CancelledOutgoingRequest = 'CancelledOutgoingRequest',
  IncomingRequestDeniedUnseenByThem = 'IncomingRequestDeniedUnseenByThem',
  IncomingRequestDeniedSeenByThem = 'IncomingRequestDeniedSeenByThem',
  OutgoingRequestDeniedSeenByMe = 'OutgoingRequestDeniedSeenByMe',
  ContactDeletedUnseenByThem = 'ContactDeletedUnseenByThem',
  ContactDeletedSeen = 'ContactDeletedSeen'
}

export const convertStatus = (
  myStatus: ContactSideStatus,
  theirStatus: ContactSideStatus
): ContactStatus => {
  switch (myStatus) {
    case ContactSideStatus.Pending:
      switch (theirStatus) {
        case ContactSideStatus.Pending:
          throw new Error('Unexpected contact status: pending+pending');
        case ContactSideStatus.WantToConnect:
          return ContactStatus.IncomingRequest;
        case ContactSideStatus.DontWantToConnect:
          throw new Error('Unexpected contact status: pending+dwtc');
        case ContactSideStatus.Deleted:
          return ContactStatus.CancelledIncomingRequest;
        default:
          throw new Error(`Unexpected contact status: pending+${theirStatus}`);
      }
    case ContactSideStatus.WantToConnect:
      switch (theirStatus) {
        case ContactSideStatus.Pending:
          return ContactStatus.OutgoingRequest;
        case ContactSideStatus.WantToConnect:
          return ContactStatus.Connected;
        case ContactSideStatus.DontWantToConnect:
          return ContactStatus.OutgoingRequestDeniedUnseenByMe;
        case ContactSideStatus.Deleted:
          return ContactStatus.ContactDeletedUnseenByMe;
        default:
          throw new Error(`Unexpected contact status: wtc+${theirStatus}`);
      }
    case ContactSideStatus.DontWantToConnect:
      switch (theirStatus) {
        case ContactSideStatus.Pending:
          throw new Error(`Unexpected contact status: dwtc+pending`);
        case ContactSideStatus.WantToConnect:
          return ContactStatus.IncomingRequestDeniedUnseenByThem;
        case ContactSideStatus.DontWantToConnect:
          throw new Error(`Unexpected contact status: dwtc+dwtc`);
        case ContactSideStatus.Deleted:
          return ContactStatus.IncomingRequestDeniedSeenByThem;
        default:
          throw new Error(`Unexpected contact status: dwtc+${theirStatus}`);
      }
    case ContactSideStatus.Deleted:
      switch (theirStatus) {
        case ContactSideStatus.Pending:
          return ContactStatus.CancelledOutgoingRequest;
        case ContactSideStatus.WantToConnect:
          return ContactStatus.ContactDeletedUnseenByThem;
        case ContactSideStatus.DontWantToConnect:
          return ContactStatus.OutgoingRequestDeniedSeenByMe;
        case ContactSideStatus.Deleted:
          return ContactStatus.ContactDeletedSeen;
        default:
          throw new Error(`Unexpected contact status: dwtc+${theirStatus}`);
      }
    default:
      throw new Error(`Unexpected contact status: ${myStatus}+${theirStatus}`);
  }
};

export interface UserContact {
  status: ContactStatus;
  contactProfile: any;
  myCustomName: string | null;
  contactCustomName: string | null;
  myTrustPoints: number;
  contactTrustPoints: number;
}

const ContactSideSchema = new Schema({
  profile: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  status: {
    type: String,
    enum: [
      ContactSideStatus.Pending,
      ContactSideStatus.WantToConnect,
      ContactSideStatus.DontWantToConnect,
      ContactSideStatus.Deleted
    ]
  },
  trustPoints: {
    type: Number,
    required: true
  },
  customName: {
    type: String
  }
});

const ContactSchema = new Schema({
  sides: [
    {
      type: ContactSideSchema
    }
  ]
});

interface IContactSideSchema extends Document {
  status: ContactSideStatus;
  trustPoints: number;
  customName?: string;
}

export interface IContactSide extends IContactSideSchema {
  profile: IProfile['_id'];
}

export interface IContactSidePopulated extends IContactSideSchema {
  profile: IProfile;
}

interface IContactBase extends Document {
  toUserContact(userProfileId: string | Types.ObjectId): Promise<UserContact>;
}

export interface IContact extends IContactBase {
  sides: Types.Array<IContactSide>;
}

export interface IContactPopulated extends IContactBase {
  sides: Types.Array<IContactSidePopulated>;
}

ContactSchema.methods.toUserContact = async function (
  userProfileId: string | Types.ObjectId
): Promise<UserContact> {
  const contact: IContact = this;
  const userSideIndex = contact.sides.findIndex(
    (side: IContactSide) => side.profile.toString() === userProfileId.toString()
  );
  if (userSideIndex < 0) {
    throw new Error('Contact does not belong to the specified user');
  }

  const userSide: IContactSide = contact.sides[userSideIndex];
  const otherSide: IContactSide = contact.sides[1 - userSideIndex];
  const status: ContactStatus = convertStatus(userSide.status, otherSide.status);

  const contactIProfile = await Profile.findById(otherSide.profile);
  const contactProfile = contactIProfile.toUserProfile(false);
  const result: UserContact = {
    status,
    contactProfile,
    myCustomName: userSide.customName || null,
    contactCustomName: otherSide.customName || null,
    myTrustPoints: userSide.trustPoints,
    contactTrustPoints: otherSide.trustPoints
  };

  return result;
};

const Contact = model<IContact>('Contact', ContactSchema);
export default Contact;
