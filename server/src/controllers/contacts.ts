import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';

import Contact, { IContact, UserContact } from '../model/Contact';
import { ContactSideStatus } from '../model/Contact';
import Profile, { IProfile } from '../model/Profile';
import * as httpErrors from '../util/httpErrors';
import logger from '../util/logger';

const contactsInListSearchCondition = (myProfileId: any): any => {
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
    let excludeProfiles: any = existingContacts && existingContacts.length > 0 ? existingContacts[0].uniqueValues : null;
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

export const requestContact = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    let contactIdentificator = req.body.identificator;
    if (!contactIdentificator || contactIdentificator.trim() === '') {
      return next(
        httpErrors.customValidationError(
          'identificator',
          'Contact identificator is required'
        )
      );
    }
    contactIdentificator = contactIdentificator.trim();

    const contactProfile: IProfile = await Profile.findOne({
      identificator: contactIdentificator
    });
    if (!contactProfile) {
      return next(
        httpErrors.customValidationError(
          'identificator',
          'Contact identificator is invalid'
        )
      );
    }

    const existingContact: IContact = await Contact.findOne({
      $and: [
        {
          sides: {
            $elemMatch: {
              profile: contactProfile._id
            }
          }
        },
        contactsInListSearchCondition(req.profileId)
      ]
    });
    if (existingContact) {
      logger.debug('existing contact');
      logger.debug(existingContact);
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

export const getContacts = async (req: any, res: Response, next: NextFunction) => {
  try {
    const dbContacts: IContact[] = await Contact.find(contactsInListSearchCondition(req.profileId));
    const userContacts: UserContact[] = await Promise.all(dbContacts.map((dbContact: IContact) => dbContact.toUserContact(req.profileId)));
    // const userContacts: UserContact[] = dbContacts.map((dbContact: IContact) => dbContact.toUserContact(req.profileId));
    res.status(200).json(userContacts);
  } catch(error) {
    next(error);
  }
}