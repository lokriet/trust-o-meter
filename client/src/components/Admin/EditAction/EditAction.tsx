import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../store/actions';
import { Action } from '../../../store/model/status';
import { Error } from '../../UI/Error/Error';

interface EditActionProps {
  statusId: string;
  action: Action;
  error: string | null;
  validateExistingAction: any;
}

const EditAction = ({
  statusId,
  action,
  error,
  validateExistingAction
}: EditActionProps) => {
  const [name, setName] = useState(action.name);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleSaveActionChanges = useCallback(() => {
    const newName = name.trim();
    if (newName === action.name) {
      return;
    }

    setValidationError(null);
    if (newName === '') {
      setValidationError('Name is required');
      return;
    }
    const actionExistsError = validateExistingAction(
      statusId,
      action._id,
      newName
    );
    if (actionExistsError) {
      setValidationError(actionExistsError);
      return;
    }

    setLoading(true);
    dispatch(
      actions.updateAction(statusId, action._id, newName, () =>
        setLoading(false)
      )
    );
  }, [dispatch, action, validateExistingAction, name, statusId]);

  const handleDeleteAction = useCallback(
    () => {
      setLoading(true);
      setValidationError(null);
      dispatch(actions.deleteAction(statusId, action._id, () => setLoading(false)));
    },
    [dispatch, statusId, action._id],
  )

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={handleSaveActionChanges}
        disabled={loading}
      />
      <button type="button" onClick={handleDeleteAction} disabled={loading}>
        Delete
      </button>
      {validationError ? <Error>{validationError}</Error> : null}
      {error ? <Error>{error}</Error> : null}
    </div>
  );
};

EditAction.propTypes = {
  statusId: PropTypes.string.isRequired,
  action: PropTypes.object.isRequired,
  error: PropTypes.string,
  validateExistingAction: PropTypes.any.isRequired
};

export default EditAction;
