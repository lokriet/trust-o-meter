import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { Action } from '../../../../../../store/model/status';
import { Error } from '../../../../../UI/Error/Error';
import classes from './ContactAction.module.scss';

interface ContactActionProps {
  actionDone: boolean;
  action: Action;
  error: string | null;
  onActionChange: any; // (actionDone, updateDoneCallback) fn
}

const ContactAction = ({
  actionDone,
  action,
  error,
  onActionChange
}: ContactActionProps) => {
  const [done, setDone] = useState(actionDone);
  const [loading, setLoading] = useState(false);
  const [savingFailed, setSavingFailed] = useState(false);

  const handleActionChangeDone = useCallback((success: boolean) => {
    setLoading(false);
    setSavingFailed(!success);
  }, []);

  const handleActionChange = useCallback(
    (event) => {
      setDone(event.target.checked);
      setLoading(true);
      setSavingFailed(false);
      onActionChange(event.target.checked, handleActionChangeDone);
    },
    [onActionChange]
  );

  return (
    <>
      <div className={classes.ContactAction}>
        <input
          type="checkbox"
          id={action._id}
          checked={done}
          onChange={handleActionChange}
          disabled={loading}
        />
        <label htmlFor={action._id}>{action.name}</label>
      </div>
      {savingFailed && error ? <Error>{error}</Error> : null}
    </>
  );
};

ContactAction.propTypes = {
  actionDone: PropTypes.bool.isRequired,
  action: PropTypes.object.isRequired,
  error: PropTypes.string,
  onActionChange: PropTypes.any.isRequired //
};

export default ContactAction;
