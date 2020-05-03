import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../store/actions';
import { Error } from '../../UI/Error/Error';
import classes from './AddAction.module.scss';

interface AddActionProps {
  statusId: string;
  error: string | null;
  validateExistingAction: any;
}

const AddAction = ({
  statusId,
  error,
  validateExistingAction
}: AddActionProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const dispatch = useDispatch();

  const handleAddButtonClicked = useCallback(() => {
    if (!showAddForm) {
      setShowAddForm(true);
    }
  }, [showAddForm]);

  const handleAddActionFinished = useCallback((success: boolean) => {
    setLoading(false);
    if (success) {
      setName('');
      setShowAddForm(false);
    }
  }, []);

  const handleAddAction = useCallback(() => {
    setValidationError(null);
    let newName = name.trim();
    if (newName === '') {
      setValidationError('Name is required');
      return;
    }
    const existingActionError = validateExistingAction(statusId, null, newName);
    if (existingActionError) {
      setValidationError(existingActionError);
      return;
    }

    setLoading(true);
    dispatch(actions.createAction(statusId, newName, handleAddActionFinished));
  }, [
    statusId,
    name,
    dispatch,
    handleAddActionFinished,
    validateExistingAction
  ]);

  const handleCancelAdding = useCallback(
    () => {
      setName('');
      setValidationError(null);
      setShowAddForm(false);
      dispatch(actions.initActionOperation(statusId, null));
    },
    [dispatch],
  )

  return (
    <>
      {showAddForm ? (
        <div className={classes.ActionContainer}>
          <div className={classes.Details}>
            <input
              className={classes.NameInput}
              type="text"
              placeholder="New activity"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          {validationError ? <Error>{validationError}</Error> : null}
          {error ? <Error>{error}</Error> : null}
          <div className={classes.ActionButtons}>
            <button
              className={`${classes.ActionButton} ${classes.DangerActionButton}`}
              type="button"
              onClick={handleCancelAdding}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className={classes.ActionButton}
              type="submit"
              onClick={handleAddAction}
              disabled={loading}
            >
              Add
            </button>
          </div>
        </div>
      ) : null}
      <div className={classes.AddButtonContainer}>
        <button
          className={classes.AddButton}
          type="button"
          onClick={handleAddButtonClicked}
        >
          <FontAwesomeIcon icon={faPlus} className={classes.AddButtonIcon} />
        </button>
      </div>
    </>
  );
};

AddAction.propTypes = {
  error: PropTypes.string,
  statusId: PropTypes.string.isRequired,
  validateExistingAction: PropTypes.any.isRequired
};

export default AddAction;
