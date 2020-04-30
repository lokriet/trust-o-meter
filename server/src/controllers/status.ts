import { NextFunction, Response } from 'express';
import _ from 'lodash';
import { Types } from 'mongoose';

import Status, { IAction, IStatus } from '../model/Status';
import { customValidationError } from '../util/httpErrors';
import * as httpErrors from '../util/httpErrors';
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

    res.status(200).json(existingStatus);
  } catch (error) {
    next(error);
  }
};