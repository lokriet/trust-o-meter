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
import { useDispatch } from 'react-redux';

import * as actions from '../../../../../store/actions';
import { Contact } from '../../../../../store/model/contact';
import ConfirmAction from '../../../../ConfirmAction/ConfirmAction';
import { Error } from '../../../../UI/Error/Error';
import classes from './ContactSettings.module.scss';

interface ContactSettingsProps {
  contact: Contact;
  error: string | null;
}

const ContactSettings = (props: ContactSettingsProps) => {
  const [showCustomNameForm, setShowCustomNameForm] = useState(false);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [myCustomName, setMyCustomName] = useState(
    props.contact.myCustomName || ''
  );
  const [changeNameError, setChangeNameError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const handleDeleteFailed = useCallback(() => {
    setLoading(false);
    setDeleteError(true);
  }, []);

  const handleDelete = useCallback(() => {
    // TODO - are you sure you want to delete
    setLoading(true);
    setDeleteError(false);
    setChangeNameError(false);
    dispatch(actions.deleteContact(props.contact._id, handleDeleteFailed));
  }, [props.contact, dispatch, handleDeleteFailed]);

  const handleCancelNameChange = useCallback(() => {
    setMyCustomName(props.contact.myCustomName || '');
    setChangeNameError(false);
    setShowCustomNameForm(false);
  }, [props.contact.myCustomName]);

  const handleChangeCustomNameDone = useCallback((success: boolean) => {
    setLoading(false);
    setChangeNameError(!success);
    if (success) {
      setShowCustomNameForm(false);
    }
  }, []);

  const handleChangeCustomName = useCallback(() => {
    setLoading(true);
    setChangeNameError(false);
    setDeleteError(false);
    dispatch(
      actions.updateContactCustomName(
        props.contact._id,
        myCustomName,
        handleChangeCustomNameDone
      )
    );
  }, [props.contact, dispatch, myCustomName, handleChangeCustomNameDone]);

  return (
    <div className={classes.ExtraDetailsContainer}>
      <div className={classes.ExtraDetailsCard}>
        <div className={classes.ActionButtons}>
          <ConfirmAction
            onConfirm={handleDelete}
            text={`Are you sure you want to delete ${
              props.contact.contactCustomName ||
              props.contact.contactProfile.username
            } from your contact list?\n\nAll trust points and unlocked activities will be lost.`}
          >
            <button
              className={`${classes.ActionButton} ${classes.DangerActionButton}`}
              disabled={loading}
            >
              Delete contact
            </button>
          </ConfirmAction>
          <button
            className={classes.ActionButton}
            onClick={() => setShowCustomNameForm(true)}
            disabled={loading}
          >
            Change my name
          </button>
        </div>
        {deleteError && props.error ? <Error>{props.error}</Error> : null}
        {showCustomNameForm ? (
          <>
            <div className={classes.ChangeCustomNameHeader}>
              {props.contact.contactCustomName ||
                props.contact.contactProfile.username ||
                '<noname>'} will see my name as:
            </div>
            <div className={classes.Details}>
              <input
                className={classes.NameInput}
                placeholder="Special name"
                type="text"
                value={myCustomName}
                onChange={(event) => setMyCustomName(event.target.value)}
              />
            </div>
            {changeNameError && props.error ? (
              <Error>{props.error}</Error>
            ) : null}
            <div className={classes.ActionButtons}>
              <button
                className={`${classes.ActionButton} ${classes.DangerActionButton}`}
                onClick={handleCancelNameChange}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={classes.ActionButton}
                onClick={handleChangeCustomName}
                disabled={loading}
              >
                Save
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

ContactSettings.propTypes = {
  contact: PropTypes.object.isRequired,
  error: PropTypes.string
};

export default ContactSettings;
