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

 import classes from './ConfirmAction.module.scss';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

interface ConfirmActionProps {
  onConfirm: any;
  text?: string;
  children: any;
  className?: string;
}

const ConfirmAction = (props: ConfirmActionProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowConfirmDialog(true)}
        className={props.className}
      >
        {props.children}
      </div>
      {showConfirmDialog ? (
        <>
          <div
            className={classes.Backdrop}
            onClick={() => setShowConfirmDialog(false)}
          ></div>
          <div className={classes.ConfirmDialog}>
            <div className={classes.ConfirmDialogText}>
              {props.text || 'Are you sure?'}
            </div>
            <div className={classes.ActionButtons}>
              <button
                className={`${classes.ActionButton} ${classes.DangerActionButton}`}
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                className={classes.ActionButton}
                onClick={props.onConfirm}
              >
                I'm sure!
              </button>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

ConfirmAction.propTypes = {
  onConfirm: PropTypes.any.isRequired,
  text: PropTypes.string
};

export default ConfirmAction;
