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

import Status, { IAction, IStatus } from '../model/Status';
import { customValidationError } from '../util/httpErrors';
import * as httpErrors from '../util/httpErrors';
import logger from '../util/logger';
import { messageAll, SocketEvents } from '../util/socket';
import { createStatusErrorSchema, createStatusRequestSchema } from '../validators/status';
import { validateAndConvert } from '../validators/validationError';


export const getStatusList = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const statusList: IStatus[] = await Status.find({}).sort({
      minTrust: 1
    });
    res.status(200).json(statusList);
  } catch (error) {
    next(error);
  }
};

export const createStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const newStatusData = req.body;
    const httpError = validateAndConvert(
      newStatusData,
      createStatusRequestSchema,
      createStatusErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    const existingStatus = await Status.findOne({
      $or: [{ name: newStatusData.name }, { minTrust: newStatusData.minTrust }]
    });
    if (existingStatus) {
      if (existingStatus.name === newStatusData.name) {
        return next(
          customValidationError('name', 'Status with this name already exists')
        );
      } else {
        return next(
          customValidationError(
            'minTrust',
            'Status with this minimal trust value already exists'
          )
        );
      }
    }

    let newStatus = new Status({
      name: newStatusData.name,
      minTrust: newStatusData.minTrust
    });
    newStatus = await newStatus.save();

    try {
      messageAll(SocketEvents.StatusUpdated, newStatus);
    } catch(error) {
      logger.error(
        `Failed to send status update`
      );
      logger.error(error);
    }

    res.status(201).json(newStatus);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedStatusId = req.params.statusId;
    let updatedStatus = await Status.findById(updatedStatusId);
    if (!updatedStatus) {
      return next(httpErrors.pageNotFoundError());
    }

    const updatedStatusData = req.body;
    const httpError = validateAndConvert(
      updatedStatusData,
      createStatusRequestSchema,
      createStatusErrorSchema
    );
    if (httpError) {
      return next(httpError);
    }

    _.extend(updatedStatus, updatedStatusData);

    const existingStatus = await Status.findOne({
      $or: [{ name: updatedStatus.name }, { minTrust: updatedStatus.minTrust }],
      _id: { $ne: Types.ObjectId(updatedStatusId) }
    });
    if (existingStatus) {
      if (existingStatus.name === updatedStatus.name) {
        return next(
          customValidationError('name', 'Status with this name already exists')
        );
      } else {
        return next(
          customValidationError(
            'minTrust',
            'Status with this minimal trust value already exists'
          )
        );
      }
    }

    updatedStatus = await updatedStatus.save();

    try {
      messageAll(SocketEvents.StatusUpdated, updatedStatus);
    } catch(error) {
      logger.error(
        `Failed to send status update`
      );
      logger.error(error);
    }

    res.status(200).json(updatedStatus);
  } catch (error) {
    next(error);
  }
};


export const deleteStatus = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedStatusId = req.params.statusId;
    const deletedStatus = await Status.findById(deletedStatusId);
    if (!deletedStatus) {
      return next(httpErrors.pageNotFoundError());
    }

    await deletedStatus.remove();

    try {
      messageAll(SocketEvents.StatusDeleted, deletedStatusId);
    } catch(error) {
      logger.error(
        `Failed to send status update`
      );
      logger.error(error);
    }

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const createAction = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const statusId = req.params.statusId;
    let existingStatus = await Status.findById(statusId);
    if (!existingStatus) {
      return next(httpErrors.pageNotFoundError());
    }

    let actionName = req.body.name;
    if (actionName) {
      actionName = actionName.trim();
    }
    if (!actionName || actionName === '') {
      return next(httpErrors.customValidationError('name', 'Name is required'));
    }
    if (existingStatus.actions.some((action: IAction) => action.name === actionName)) {
      return next(httpErrors.customValidationError('name', 'This action already exists'));
    }

    existingStatus.actions.push({name: actionName});
    existingStatus = await existingStatus.save();

    try {
      messageAll(SocketEvents.StatusUpdated, existingStatus);
    } catch(error) {
      logger.error(
        `Failed to send status update`
      );
      logger.error(error);
    }

    res.status(201).json(existingStatus);
  } catch (error) {
    next(error);
  }
};

export const updateAction = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const statusId = req.params.statusId;
    let existingStatus = await Status.findById(statusId);
    if (!existingStatus) {
      return next(httpErrors.pageNotFoundError());
    }

    const actionId = req.params.actionId;
    const actionIndex = existingStatus.actions.findIndex((action: IAction) => action._id.toString() === actionId);
    if (actionIndex < 0) {
      return next(httpErrors.pageNotFoundError());
    }

    let actionName = req.body.name;
    if (actionName) {
      actionName = actionName.trim();
    }
    if (!actionName || actionName === '') {
      return next(httpErrors.customValidationError('name', 'Name is required'));
    }
    if (existingStatus.actions.some((action: IAction) => action._id.toString() !== actionId && action.name === actionName)) {
      return next(httpErrors.customValidationError('name', 'This action already exists'));
    }

    existingStatus.actions[actionIndex].name = actionName;
    existingStatus = await existingStatus.save();

    try {
      messageAll(SocketEvents.StatusUpdated, existingStatus);
    } catch(error) {
      logger.error(
        `Failed to send status update`
      );
      logger.error(error);
    }

    res.status(200).json(existingStatus);
  } catch (error) {
    next(error);
  }
};

export const deleteAction = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const statusId = req.params.statusId;
    let existingStatus = await Status.findById(statusId);
    if (!existingStatus) {
      return next(httpErrors.pageNotFoundError());
    }

    const actionId = req.params.actionId;
    const actionIndex = existingStatus.actions.findIndex((action: IAction) => action._id.toString() === actionId);
    if (actionIndex < 0) {
      return next(httpErrors.pageNotFoundError());
    }

    existingStatus.actions.splice(actionIndex, 1);
    existingStatus = await existingStatus.save();

    try {
      messageAll(SocketEvents.StatusUpdated, existingStatus);
    } catch(error) {
      logger.error(
        `Failed to send status update`
      );
      logger.error(error);
    }

    res.status(200).json(existingStatus);
  } catch (error) {
    next(error);
  }
};
