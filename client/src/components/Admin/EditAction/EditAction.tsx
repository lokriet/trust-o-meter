import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../store/actions';
import { Action } from '../../../store/model/status';
import { Error } from '../../UI/Error/Error';
import classes from './EditAction.module.scss';

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

  const hasChanges = useCallback((): boolean => {
    return name.trim() !== action.name;
  }, [name, action.name]);

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

  const handleDiscardActionChanges = useCallback(() => {
    setName(action.name);
    setValidationError(null);
    dispatch(actions.initActionOperation(statusId, action._id));
  }, [dispatch, statusId, action]);

  const handleDeleteAction = useCallback(() => {
    setLoading(true);
    setValidationError(null);
    dispatch(
      actions.deleteAction(statusId, action._id, () => setLoading(false))
    );
  }, [dispatch, statusId, action._id]);

  return (
    <div className={classes.ActionContainer}>
      <div className={classes.Details}>
        <input
          className={classes.NameInput}
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Activity"
          disabled={loading}
        />
        <button
          className={classes.DeleteButton}
          type="button"
          onClick={handleDeleteAction}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      </div>
      {validationError ? <Error>{validationError}</Error> : null}
      {error ? <Error>{error}</Error> : null}
      {hasChanges() ? (
        <div className={classes.ActionButtons}>
          <button
            className={`${classes.ActionButton} ${classes.DangerActionButton}`}
            type="button"
            onClick={handleDiscardActionChanges}
            disabled={loading}
          >
            Discard changes
          </button>
          <button
            className={classes.ActionButton}
            type="submit"
            onClick={handleSaveActionChanges}
            disabled={loading}
          >
            Save changes
          </button>
        </div>
      ) : null}
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
