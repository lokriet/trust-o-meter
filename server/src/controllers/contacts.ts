import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';

import Contact, { IContact, IContactSide, UserContact } from '../model/Contact';
import { ContactSideStatus } from '../model/Contact';
import Profile, { IProfile } from '../model/Profile';
import * as httpErrors from '../util/httpErrors';
import logger from '../util/logger';

const contactsInListSearchCondition = (myProfileId: string): any => {
  return {
    $or: [
      {
        sides: {
          $elemMatch: {
            profile: Types.ObjectId(myProfileId),
            status: ContactSideStatus.WantToConnect
          }
        }
      },
      {
        $and: [
          {
            sides: {
              $elemMatch: {
                profile: Types.ObjectId(myProfileId),
                status: ContactSideStatus.Pending
              }
            }
          },
          {
            sides: {
              $elemMatch: {
                profile: {
                  $ne: Types.ObjectId(myProfileId)
                },
                status: ContactSideStatus.WantToConnect
              }
            }
          }
        ]
      }
    ]
  };
};

export const searchContacts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const searchString = req.body.searchString;
    if (!searchString || searchString.trim() === '') {
      next(
        httpErrors.customValidationError(
          'searchString',
          'Please enter a search string.'
        )
      );
    }

    const usernameRegex = new RegExp(searchString, 'i');

    const existingContacts: any = await Contact.aggregate([
      { $match: contactsInListSearchCondition(req.profileId) },
      { $unwind: '$sides' },
      {
        $group: {
          _id: null,
          uniqueValues: { $addToSet: '$sides.profile' }
        }
      }
    ]);
    let excludeProfiles: any =
      existingContacts && existingContacts.length > 0
        ? existingContacts[0].uniqueValues
        : null;
    if (!excludeProfiles) {
      excludeProfiles = [req.profileId];
    }

    const profiles = await Profile.find({
      $or: [
        {
          identificator: searchString
        },
        {
          username: {
            $regex: usernameRegex
          }
        }
      ],
      _id: {
        $nin: excludeProfiles
      }
    });

    const result = profiles.map((profile) => profile.toUserProfile(false));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const getContacts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const dbContacts: IContact[] = await Contact.find(
      contactsInListSearchCondition(req.profileId)
    );
    const userContacts: UserContact[] = await Promise.all(
      dbContacts.map((dbContact: IContact) =>
        dbContact.toUserContact(req.profileId)
      )
    );
    res.status(200).json(userContacts);
  } catch (error) {
    next(error);
  }
};

export const requestContact = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const contactProfile = await getContactProfile(req.body.identificator);
    const existingContact: IContact = await getExistingContact(
      contactProfile._id,
      req.profileId
    );

    if (existingContact) {
      return next(
        httpErrors.customValidationError(
          'identificator',
          'Requested user is already in contacts list'
        )
      );
    }

    let contact = new Contact({
      sides: [
        {
          profile: req.profileId,
          status: ContactSideStatus.WantToConnect,
          trustPoints: 0
        },
        {
          profile: contactProfile._id,
          status: ContactSideStatus.Pending,
          trustPoints: 0
        }
      ]
    });

    contact = await contact.save();
    const result = await contact.toUserContact(req.profileId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


export const approveContactRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedContact = await contactStatusChange({
      userProfileId: req.profileId,
      contactIdentificator: req.body.identificator,
      expectedUserStatus: ContactSideStatus.Pending,
      expectedContactStatus: ContactSideStatus.WantToConnect,
      changeToStatus: ContactSideStatus.WantToConnect
    });
    const userContact: UserContact = await updatedContact.toUserContact(req.profileId);
    res.status(200).json(userContact);
  } catch (error) {
    next(error);
  }
};

export const rejectContactRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedContact = await contactStatusChange({
      userProfileId: req.profileId,
      contactIdentificator: req.body.identificator,
      expectedUserStatus: ContactSideStatus.Pending,
      expectedContactStatus: ContactSideStatus.WantToConnect,
      changeToStatus: ContactSideStatus.DontWantToConnect
    });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const withdrawContactRequest = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedContact = await contactStatusChange({
      userProfileId: req.profileId,
      contactIdentificator: req.body.identificator,
      expectedUserStatus: ContactSideStatus.WantToConnect,
      expectedContactStatus: ContactSideStatus.Pending,
      changeToStatus: ContactSideStatus.Deleted
    });

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const confirmRequestRejectSeen = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedContact = await contactStatusChange({
      userProfileId: req.profileId,
      contactIdentificator: req.body.identificator,
      expectedUserStatus: ContactSideStatus.WantToConnect,
      expectedContactStatus: ContactSideStatus.DontWantToConnect,
      changeToStatus: ContactSideStatus.Deleted
    });

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedContact = await contactStatusChange({
      userProfileId: req.profileId,
      contactIdentificator: req.body.identificator,
      expectedUserStatus: ContactSideStatus.WantToConnect,
      expectedContactStatus: ContactSideStatus.WantToConnect,
      changeToStatus: ContactSideStatus.Deleted
    });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const confirmDeletedContactSeen = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedContact = await contactStatusChange({
      userProfileId: req.profileId,
      contactIdentificator: req.body.identificator,
      expectedUserStatus: ContactSideStatus.WantToConnect,
      expectedContactStatus: ContactSideStatus.Deleted,
      changeToStatus: ContactSideStatus.Deleted
    });

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

const contactStatusChange = async (props: {
  userProfileId: string;
  contactIdentificator: string;
  expectedUserStatus: ContactSideStatus;
  expectedContactStatus: ContactSideStatus;
  changeToStatus: ContactSideStatus;
}): Promise<IContact> => {
  const contactProfile = await getContactProfile(props.contactIdentificator);
  let existingContact: IContact = await getExistingContact(
    contactProfile._id,
    props.userProfileId
  );

  if (!existingContact) {
    throw httpErrors.customValidationError(
      'identificator',
      'User is not in contacts list'
    );
  }

  const userSideIndex = existingContact.sides.findIndex(
    (side: IContactSide) =>
      side.profile.toString() === props.userProfileId
  );
  const contactSideIndex = 1 - userSideIndex;
  if (
    existingContact.sides[userSideIndex].status !== props.expectedUserStatus ||
    existingContact.sides[contactSideIndex].status !==
      props.expectedContactStatus
  ) {
    throw httpErrors.customValidationError(
      'identificator',
      'Contact is not in pending incoming request status'
    );
  }

  existingContact.sides[userSideIndex].status = props.changeToStatus;
  existingContact = await existingContact.save();
  return existingContact;
};

const getContactProfile = async (
  contactIdentificator: string
): Promise<IProfile> => {
  const trimmedContactIdentificator = (contactIdentificator || '').trim();
  if (trimmedContactIdentificator === '') {
    throw httpErrors.customValidationError(
      'identificator',
      'Contact identificator is required'
    );
  }

  const contactProfile: IProfile = await Profile.findOne({
    identificator: trimmedContactIdentificator
  });
  if (!contactProfile) {
    throw httpErrors.customValidationError(
      'identificator',
      'Contact identificator is invalid'
    );
  }
  return contactProfile;
};

const getExistingContact = async (
  contactProfileId: Types.ObjectId,
  userProfileId: string
): Promise<IContact> => {
  const existingContact: IContact = await Contact.findOne({
    $and: [
      {
        sides: {
          $elemMatch: {
            profile: contactProfileId
          }
        }
      },
      contactsInListSearchCondition(userProfileId)
    ]
  });
  return existingContact;
};
