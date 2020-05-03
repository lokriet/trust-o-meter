import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../../store/actions';
import { Contact } from '../../../../../store/model/contact';
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
    dispatch(
      actions.deleteContact(props.contact.contactProfile.identificator, handleDeleteFailed)
    );
  }, [props.contact, dispatch]);

  const handleCancelNameChange = useCallback(() => {
    setMyCustomName(props.contact.myCustomName || '');
    setChangeNameError(false);
    setShowCustomNameForm(false);
  }, []);

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
        props.contact.contactProfile.identificator,
        myCustomName,
        handleChangeCustomNameDone
      )
    );
  }, [props.contact, dispatch, myCustomName]);

  return (
    <div className={classes.ExtraDetailsContainer}>
      <div className={classes.ExtraDetailsCard}>
        <div className={classes.ActionButtons}>
          <button
            className={`${classes.ActionButton} ${classes.DangerActionButton}`}
            onClick={handleDelete}
            disabled={loading}
          >
            Delete contact
          </button>
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
              My name for{' '}
              {props.contact.contactCustomName ||
                props.contact.contactProfile.username ||
                '<noname>'}
              :
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
            {changeNameError && props.error ? <Error>{props.error}</Error> : null}
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
