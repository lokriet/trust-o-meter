/*
 * Copyright (C) 2020 Evgenia Lazareva
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { NextFunction, Response } from 'express';
import _ from 'lodash';
import { Types } from 'mongoose';

import Contact, { IContact, IContactSide, UserContact } from '../model/Contact';
import { ContactSideStatus } from '../model/Contact';
import Profile, { IProfile } from '../model/Profile';
import Status, { IAction, IStatus } from '../model/Status';
import * as httpErrors from '../util/httpErrors';
import logger from '../util/logger';
import {
  changeActionStateErrorSchema,
  changeActionStateRequestSchema,
  updateContactCustomNameErrorSchema,
  updateContactCustomNameRequestSchema,
  updateContactTrustErrorSchema,
  updateContactTrustRequestSchema,
} from '../validators/contacts';
import { validateAndConvert } from '../validators/validationError';


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
      changeToStatus: ContactSideStatus.WantToConnect,
      finalStatus: false
    });
    const userContact: UserContact = await updatedContact.toUserContact(
      req.profileId
    );
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
      changeToStatus: ContactSideStatus.DontWantToConnect,
      finalStatus: false
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
      changeToStatus: ContactSideStatus.Deleted,
      finalStatus: true
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
      changeToStatus: ContactSideStatus.Deleted,
      finalStatus: true
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
      changeToStatus: ContactSideStatus.Deleted,
      finalStatus: false
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
      changeToStatus: ContactSideStatus.Deleted,
      finalStatus: true
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
  finalStatus: boolean;
}): Promise<IContact | null> => {
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
    (side: IContactSide) => side.profile.toString() === props.userProfileId
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

  if (props.finalStatus) {
    await existingContact.remove();
    return null;
  } else {
    existingContact.sides[userSideIndex].status = props.changeToStatus;
    existingContact = await existingContact.save();
    return existingContact;
  }

};

export const updateContactCustomName = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData = req.body;
    const httpError = validateAndConvert(
      requestData,
      updateContactCustomNameRequestSchema,
      updateContactCustomNameErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    const contactProfile = await getContactProfile(requestData.identificator);
    let existingContact: IContact = await getExistingContact(
      contactProfile._id,
      req.profileId
    );

    if (!existingContact) {
      throw httpErrors.customValidationError(
        'identificator',
        'User is not in contacts list'
      );
    }

    const userSideIndex = existingContact.sides.findIndex(
      (side: IContactSide) => side.profile.toString() === req.profileId
    );
    const contactSideIndex = 1 - userSideIndex;
    if (
      existingContact.sides[userSideIndex].status !==
        ContactSideStatus.WantToConnect ||
      existingContact.sides[contactSideIndex].status !==
        ContactSideStatus.WantToConnect
    ) {
      throw httpErrors.customValidationError(
        'identificator',
        'Contact is not in connected status'
      );
    }

    existingContact.sides[userSideIndex].customName = requestData.customName;
    existingContact = await existingContact.save();
    const updatedUserContact: UserContact = await existingContact.toUserContact(
      req.profileId
    );
    res.status(200).json(updatedUserContact);
  } catch (error) {
    next(error);
  }
};

export const updateContactTrust = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData = req.body;
    const httpError = validateAndConvert(
      requestData,
      updateContactTrustRequestSchema,
      updateContactTrustErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    const contactProfile = await getContactProfile(requestData.identificator);
    let existingContact: IContact = await getExistingContact(
      contactProfile._id,
      req.profileId
    );

    if (!existingContact) {
      throw httpErrors.customValidationError(
        'identificator',
        'User is not in contacts list'
      );
    }

    const userSideIndex = existingContact.sides.findIndex(
      (side: IContactSide) => side.profile.toString() === req.profileId
    );
    const contactSideIndex = 1 - userSideIndex;
    if (
      existingContact.sides[userSideIndex].status !==
        ContactSideStatus.WantToConnect ||
      existingContact.sides[contactSideIndex].status !==
        ContactSideStatus.WantToConnect
    ) {
      throw httpErrors.customValidationError(
        'identificator',
        'Contact is not in connected status'
      );
    }

    existingContact.sides[userSideIndex].trustPoints = requestData.increase
      ? existingContact.sides[userSideIndex].trustPoints + 1
      : Math.max(existingContact.sides[userSideIndex].trustPoints - 1, 0);
    existingContact = await existingContact.save();
    const updatedUserContact: UserContact = await existingContact.toUserContact(
      req.profileId
    );
    res.status(200).json(updatedUserContact);
  } catch (error) {
    next(error);
  }
};

export const changeActionState = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const requestData = req.body;
    const httpError = validateAndConvert(
      requestData,
      changeActionStateRequestSchema,
      changeActionStateErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    const contactProfile = await getContactProfile(requestData.identificator);
    let existingContact: IContact = await getExistingContact(
      contactProfile._id,
      req.profileId
    );

    if (!existingContact) {
      throw httpErrors.customValidationError(
        'identificator',
        'User is not in contacts list'
      );
    }

    if (
      existingContact.sides[0].status !==
        ContactSideStatus.WantToConnect ||
      existingContact.sides[1].status !==
        ContactSideStatus.WantToConnect
    ) {
      throw httpErrors.customValidationError(
        'identificator',
        'Contact is not in connected status'
      );
    }

    const status: IStatus = await Status.findById(requestData.statusId);
    if (!status || !status.actions.some((action: IAction) => action._id.toString() === requestData.actionId)) {
      throw httpErrors.customValidationError(
        'actionId',
        'Unexpected action identificator'
      );
    }

    const contactTrust = Math.floor((existingContact.sides[0].trustPoints + existingContact.sides[1].trustPoints) / 2);
    if (status.minTrust > contactTrust) {
      throw httpErrors.customValidationError(
        'actionId',
        'Unexpected action identificator'
      );
    }

    const actionIndex = existingContact.doneActions.indexOf(requestData.actionId);
    if (requestData.actionDone && actionIndex < 0) {
      existingContact.doneActions.push(requestData.actionId);
    } else if (!requestData.actionDone && actionIndex >= 0) {
      existingContact.doneActions.splice(actionIndex, 1);
    }

    existingContact = await existingContact.save();
    const updatedUserContact: UserContact = await existingContact.toUserContact(
      req.profileId
    );
    res.status(200).json(updatedUserContact);
  } catch (error) {
    next(error);
  }
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
