import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../../store/actions';
import { Contact } from '../../../../../store/model/contact';
import { Status } from '../../../../../store/model/status';
import { State } from '../../../../../store/reducers/state';
import ContactStatus from './ContactStatus/ContactStatus';
import classes from './ContactStatusList.module.scss';

interface ContactStatusListProps {
  statusList: Status[];
  contact: Contact;
  error: string | null;
}

const ContactStatusList = (props: ContactStatusListProps) => {
  const contactTrust = Math.floor(
    (props.contact.myTrustPoints + props.contact.contactTrustPoints) / 2
  );
  const dispatch = useDispatch();

  const handleActionChange = useCallback(
    (
      actionDone: boolean,
      statusId: string,
      actionId: string,
      updateDoneCallback: any
    ) => {
      dispatch(
        actions.changeContactActionState(
          props.contact.contactProfile.identificator,
          statusId,
          actionId,
          actionDone,
          updateDoneCallback
        )
      );
    },
    [dispatch, props.contact]
  );

  return (
    <div className={classes.ExtraDetailsContainer}>
      <div className={classes.ExtraDetailsCard}>
        <div className={classes.Header}>Unlocked activities</div>
        {props.statusList.map((status: Status) =>
          status.minTrust <= contactTrust ? (
            <ContactStatus
              key={status._id}
              status={status}
              doneActions={props.contact.doneActions}
              error={props.error}
              onActionChange={(
                actionId: string,
                actionDone: boolean,
                updateDoneCallback: any
              ) =>
                handleActionChange(
                  actionDone,
                  status._id,
                  actionId,
                  updateDoneCallback
                )
              }
            />
          ) : null
        )}
      </div>
    </div>
  );
};

ContactStatusList.propTypes = {
  contact: PropTypes.object.isRequired,
  error: PropTypes.string
};

const mapStateToProps = (state: State): Partial<ContactStatusListProps> => {
  return {
    statusList: state.status.statusList
  };
};

export default connect(mapStateToProps)(ContactStatusList);
