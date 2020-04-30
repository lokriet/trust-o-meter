import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../store/actions';
import { Error } from '../../UI/Error/Error';

interface AddStatusProps {
  error: string | null;
  validateExistingStatus: any;
}

const AddStatus = ({error, validateExistingStatus}: AddStatusProps) => {
  const [name, setName] = useState('');
  const [minTrust, setMinTrust] = useState(0);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleAddStatusFinished = useCallback((success: boolean) => {
    setLoading(false);
    if (success) {
      setName('');
      setMinTrust(0);
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
  }, [name, minTrust, dispatch, handleAddStatusFinished, validateExistingStatus]);

  return (
    <div>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        type="number"
        min="0"
        placeholder="Minimal Trust"
        value={minTrust}
        onChange={(event) => setMinTrust(Number(event.target.value))}
      />
      {validationError ? <Error>{validationError}</Error> : null}
      {error ? <Error>{error}</Error> : null}
      <button type="submit" onClick={handleAddStatus} disabled={loading}>
        Add
      </button>
    </div>
  );
};

AddStatus.propTypes = {
  error: PropTypes.string,
  validateExistingStatus: PropTypes.any.isRequired
};

export default AddStatus;
