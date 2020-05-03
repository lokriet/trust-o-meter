import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import { Action, Status } from '../../../../../../store/model/status';
import ContactAction from '../ContactAction/ContactAction';
import classes from './ContactStatus.module.scss';

interface ContactStatusProps {
  status: Status;
  doneActions: string[];
  onActionChange: any;
}

const ContactStatus = (props: ContactStatusProps) => {
  const statusCheckbox = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let statusCheckboxChecked = false;
    let statusCheckboxIntermediate = false;

    let actionsDoneCount = 0;
    props.status.actions.forEach((action: Action) => {
      if (props.doneActions.includes(action._id)) {
        actionsDoneCount++;
      }
    });

    if (actionsDoneCount > 0) {
      statusCheckboxChecked = true;
      
      if (actionsDoneCount < props.status.actions.length) {
        statusCheckboxIntermediate = true;
      }
    }

    const checkbox = statusCheckbox.current;
    if (checkbox) {
      checkbox.checked = statusCheckboxChecked;
      checkbox.indeterminate = statusCheckboxIntermediate
    }

  }, [statusCheckbox, props.doneActions, props.status.actions]);

  return (
    <div>
      <div className={classes.StatusHeader}>
        <input type="checkbox" ref={statusCheckbox} disabled />
        <label>{props.status.name}</label>
      </div>
      {props.status.actions.map((action: Action) => (
        <ContactAction
          key={action._id}
          action={action}
          actionDone={props.doneActions.includes(action._id)}
          onActionChange={(actionDone: boolean, updateDoneCallback: any) =>
            props.onActionChange(action._id, actionDone, updateDoneCallback)
          }
        />
      ))}
    </div>
  );
};

ContactStatus.propTypes = {
  status: PropTypes.object.isRequired,
  doneActions: PropTypes.array.isRequired,
  onActionChange: PropTypes.any.isRequired
};

export default ContactStatus;
