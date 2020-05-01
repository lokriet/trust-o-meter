import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';

import { Contact } from '../../../../../store/model/contact';
import { Action } from '../../../../../store/model/status';

interface ContactActionProps {
  actionDone: boolean;
  action: Action;
  onActionChange: any; // (actionDone, updateDoneCallback) fn
}

const ContactAction = ({
  actionDone,
  action,
  onActionChange
}: ContactActionProps) => {
  const [done, setDone] = useState(actionDone);
  const [loading, setLoading] = useState(false);

  const handleActionChange = useCallback(
    (event) => {
      setDone(event.target.checked);
      setLoading(true);
      onActionChange(event.target.checked, () => setLoading(false));
    },
    [onActionChange]
  );

  return (
    <div>
      <input
        type="checkbox"
        id={action._id}
        checked={done}
        onChange={handleActionChange}
        disabled={loading}
      />
      <label htmlFor={action._id}>{action.name}</label>
    </div>
  );
};

ContactAction.propTypes = {
  actionDone: PropTypes.bool.isRequired,
  action: PropTypes.object.isRequired,
  onActionChange: PropTypes.any.isRequired //
};

export default ContactAction;
