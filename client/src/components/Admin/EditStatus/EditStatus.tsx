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
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../store/actions';
import { Action, Status } from '../../../store/model/status';
import { Error } from '../../UI/Error/Error';
import AddAction from '../AddAction/AddAction';
import EditAction from '../EditAction/EditAction';
import classes from './EditStatus.module.scss';
import ConfirmAction from '../../ConfirmAction/ConfirmAction';



interface EditStatusProps {
  status: Status;
  error: string | null;
  actionErrors: any;
  validateExistingStatus: any;
  validateExistingAction: any;
}

const EditStatus = ({
  validateExistingStatus,
  validateExistingAction,
  status,
  error,
  actionErrors
}: EditStatusProps) => {
  const [name, setName] = useState(status.name);
  const [minTrust, setMinTrust] = useState(status.minTrust);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const hasChanges = useCallback((): boolean => {
    return name.trim() !== status.name || minTrust !== status.minTrust;
  }, [name, minTrust, status.name, status.minTrust]);

  const handleSaveStatusChanges = useCallback(() => {
    if (name.trim() === status.name && minTrust === status.minTrust) {
      return;
    }

    setValidationError(null);
    let newName = name.trim();
    if (newName === '') {
      setValidationError('Name is required');
      return;
    }
    const statusUpdate = { name: newName, minTrust };
    let existingStatusError = validateExistingStatus(status._id, statusUpdate);
    if (existingStatusError) {
      setValidationError(existingStatusError);
      return;
    }

    setLoading(true);
    dispatch(
      actions.updateStatus(status._id, { name, minTrust }, () =>
        setLoading(false)
      )
    );
  }, [name, minTrust, dispatch, status, validateExistingStatus]);

  const handleDiscardStatusChanges = useCallback(() => {
    setName(status.name);
    setMinTrust(status.minTrust);
    setValidationError(null);
    dispatch(actions.initStatusOperation(status._id));
  }, [dispatch, status]);

  const handleDeleteStatus = useCallback(() => {
    setValidationError(null);
    setLoading(true);
    dispatch(actions.deleteStatus(status._id, () => setLoading(false)));
  }, [dispatch, status]);

  return (
    <div className={classes.StatusCard}>
      <div className={classes.Details}>
        <input
          className={classes.NameInput}
          type="text"
          value={name}
          placeholder="Status name"
          onChange={(event) => setName(event.target.value)}
          // onBlur={handleSaveStatusChanges}
          disabled={loading}
        />
        <input
          className={classes.MinTrustInput}
          type="number"
          min="0"
          value={minTrust}
          placeholder="Minimal Trust"
          onChange={(event) => setMinTrust(Number(event.target.value))}
          // onBlur={handleSaveStatusChanges}
          disabled={loading}
        />
        
        <ConfirmAction onConfirm={handleDeleteStatus} text={`Are you sure you want to delete ${status.name} status?`}>
          <button
            className={classes.DeleteButton}
            type="button"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </ConfirmAction>
      </div>
      {validationError ? <Error>{validationError}</Error> : null}
      {error ? <Error>{error}</Error> : null}
      {hasChanges() ? (
        <div className={classes.ActionButtons}>
          <button
            className={`${classes.ActionButton} ${classes.DangerActionButton}`}
            type="button"
            onClick={handleDiscardStatusChanges}
            disabled={loading}
          >
            Discard changes
          </button>
          <button
            className={classes.ActionButton}
            type="submit"
            onClick={handleSaveStatusChanges}
            disabled={loading}
          >
            Save changes
          </button>
        </div>
      ) : null}

      <div className={classes.ActionsContainer}>
        <div className={classes.ActionsTitle}>Unlocked activities:</div>

        {status.actions.map((item: Action) => (
          <EditAction
            statusId={status._id}
            action={item}
            key={item._id}
            error={actionErrors ? actionErrors[item._id] : null}
            validateExistingAction={validateExistingAction}
          />
        ))}
        <AddAction
          statusId={status._id}
          error={actionErrors?.ADD}
          validateExistingAction={validateExistingAction}
        />
      </div>
    </div>
    // <div>
    //   <input
    //     type="text"
    //     defaultValue={status.name}
    //     placeholder="Name"
    //     onChange={(event) => setName(event.target.value)}
    //     onBlur={handleSaveStatusChanges}
    //     disabled={loading}
    //   />
    //   <input
    //     type="number"
    //     min="0"
    //     defaultValue={status.minTrust}
    //     placeholder="Minimal Trust"
    //     onChange={(event) => setMinTrust(Number(event.target.value))}
    //     onBlur={handleSaveStatusChanges}
    //     disabled={loading}
    //   />
    //   <button type="button" onClick={handleDeleteStatus} disabled={loading}>
    //     Delete
    //   </button>
    //   {validationError ? <Error>{validationError}</Error> : null}
    //   {error ? <Error>{error}</Error> : null}

    //   <AddAction
    //     statusId={status._id}
    //     error={actionErrors?.ADD}
    //     validateExistingAction={validateExistingAction}
    //   />
    //   {status.actions.map((item: Action) => (
    //     <EditAction
    //       statusId={status._id}
    //       action={item}
    //       key={item._id}
    //       error={actionErrors ? actionErrors[item._id] : null}
    //       validateExistingAction={validateExistingAction}
    //     />
    //   ))}
    // </div>
  );
};

EditStatus.propTypes = {
  status: PropTypes.object.isRequired,
  error: PropTypes.string,
  actionErrors: PropTypes.any,
  validateExistingStatus: PropTypes.any.isRequired,
  validateExistingAction: PropTypes.any.isRequired
};

export default EditStatus;
