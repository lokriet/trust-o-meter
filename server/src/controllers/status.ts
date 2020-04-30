import { NextFunction, Response } from 'express';

import Status, { IStatusPopulated } from '../model/Status';
import { customValidationError } from '../util/httpErrors';
import {
  createStatusErrorSchema,
  createStatusRequestSchema
} from '../validators/status';
import { validateAndConvert } from '../validators/validationError';

export const getStatusList = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const statusList: IStatusPopulated[] = await Status.find({})
      .populate({ path: 'actions' })
      .sort({ minTrust: 1 });
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
