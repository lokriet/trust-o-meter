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
    [onActionChange, handleActionChangeDone]
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
