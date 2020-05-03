import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../store/actions';
import { Error } from '../../UI/Error/Error';
import classes from './AddStatus.module.scss';

interface AddStatusProps {
  error: string | null;
  validateExistingStatus: any;
}

const AddStatus = ({ error, validateExistingStatus }: AddStatusProps) => {
  const [name, setName] = useState('');
  const [minTrust, setMinTrust] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const dispatch = useDispatch();

  const handleAddButtonClicked = useCallback(() => {
    if (!showAddForm) {
      setShowAddForm(true);
    }
  }, [showAddForm]);

  const handleCancelAdding = useCallback(() => {
    setName('');
    setMinTrust(0);
    setValidationError(null);
    setShowAddForm(false);
    dispatch(actions.initStatusOperation(null));
  }, [dispatch]);

  const handleAddStatusFinished = useCallback((success: boolean) => {
    setLoading(false);
    if (success) {
      setName('');
      setMinTrust(0);
      setShowAddForm(false);
    }
  }, []);

  const handleAddStatus = useCallback(() => {
    setValidationError(null);
    let newName = name.trim();
    if (newName === '') {
      setValidationError('Name is required');
      return;
    }
    const newStatus = { name: newName, minTrust };
    let existingStatusError = validateExistingStatus(null, newStatus);
    if (existingStatusError) {
      setValidationError(existingStatusError);
      return;
    }

    dispatch(actions.createStatus(newStatus, handleAddStatusFinished));
  }, [
    name,
    minTrust,
    dispatch,
    handleAddStatusFinished,
    validateExistingStatus
  ]);

  return (
    <>
      <div className={classes.AddButtonContainer}>
        <button
          className={classes.AddButton}
          type="button"
          onClick={handleAddButtonClicked}
        >
          <FontAwesomeIcon icon={faPlus} className={classes.AddButtonIcon} />
        </button>
      </div>

      {showAddForm ? (
        <div className={classes.StatusCard}>
          <div className={classes.Details}>
            <input
              className={classes.NameInput}
              type="text"
              placeholder="Status name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <input
              className={classes.MinTrustInput}
              type="number"
              min="0"
              placeholder="Minimal Trust"
              value={minTrust}
              onChange={(event) => setMinTrust(Number(event.target.value))}
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
              onClick={handleAddStatus}
              disabled={loading}
            >
              Add
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};

AddStatus.propTypes = {
  error: PropTypes.string,
  validateExistingStatus: PropTypes.any.isRequired
};

export default AddStatus;
