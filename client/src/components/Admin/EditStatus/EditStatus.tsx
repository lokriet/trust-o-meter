import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../store/actions';
import { Action, Status } from '../../../store/model/status';
import { Error } from '../../UI/Error/Error';
import AddAction from '../AddAction/AddAction';
import EditAction from '../EditAction/EditAction';

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

  const handleDeleteStatus = useCallback(() => {
    setValidationError(null);
    setLoading(true);
    dispatch(actions.deleteStatus(status._id, () => setLoading(false)));
  }, [dispatch, status]);

  return (
    <div>
      <input
        type="text"
        defaultValue={status.name}
        placeholder="Name"
        onChange={(event) => setName(event.target.value)}
        onBlur={handleSaveStatusChanges}
        disabled={loading}
      />
      <input
        type="number"
        min="0"
        defaultValue={status.minTrust}
        placeholder="Minimal Trust"
        onChange={(event) => setMinTrust(Number(event.target.value))}
        onBlur={handleSaveStatusChanges}
        disabled={loading}
      />
      <button type="button" onClick={handleDeleteStatus} disabled={loading}>
        Delete
      </button>
      {validationError ? <Error>{validationError}</Error> : null}
      {error ? <Error>{error}</Error> : null}

      <AddAction
        statusId={status._id}
        error={actionErrors?.ADD}
        validateExistingAction={validateExistingAction}
      />
      {status.actions.map((item: Action) => (
        <EditAction
          statusId={status._id}
          action={item}
          key={item._id}
          error={actionErrors ? actionErrors[item._id] : null}
          validateExistingAction={validateExistingAction}
        />
      ))}
    </div>
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
