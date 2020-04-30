import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../store/actions';
import { Error } from '../../UI/Error/Error';

interface AddActionProps {
  statusId: string;
  error: string | null;
  validateExistingAction: any;
}

const AddAction = ({statusId, error, validateExistingAction}: AddActionProps) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const handleAddActionFinished = useCallback((success: boolean) => {
    setLoading(false);
    if (success) {
      setName('');
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
  }, [statusId, name, dispatch, handleAddActionFinished, validateExistingAction]);

  return (
    <div>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      {validationError ? <Error>{validationError}</Error> : null}
      {error ? <Error>{error}</Error> : null}
      <button type="submit" onClick={handleAddAction} disabled={loading}>Add</button>
    </div>
  );
};

AddAction.propTypes = {
  error: PropTypes.string,
  statusId: PropTypes.string.isRequired,
  validateExistingAction: PropTypes.any.isRequired
};

export default AddAction;
