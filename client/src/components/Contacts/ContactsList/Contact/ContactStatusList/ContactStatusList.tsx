import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { useDispatch } from 'react-redux';

import * as actions from '../../../../../store/actions';

import { Contact } from '../../../../../store/model/contact';
import { Action, Status } from '../../../../../store/model/status';
import { State } from '../../../../../store/reducers/state';
import ContactAction from './ContactAction';

interface ContactStatusListProps {
  statusList: Status[];
  contact: Contact;
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
    <div>
      {props.statusList.map((status: Status) =>
        status.minTrust <= contactTrust ? (
          <div key={status._id}>
            <h3>{status.name}</h3>
            {status.actions.map((action: Action) => (
              <ContactAction
                key={action._id}
                action={action}
                actionDone={props.contact.doneActions.includes(action._id)}
                onActionChange={(
                  actionDone: boolean,
                  updateDoneCallback: any
                ) =>
                  handleActionChange(
                    actionDone,
                    status._id,
                    action._id,
                    updateDoneCallback
                  )
                }
              />
            ))}
          </div>
        ) : null
      )}
    </div>
  );
};

ContactStatusList.propTypes = {
  contact: PropTypes.object.isRequired
};

const mapStateToProps = (state: State): Partial<ContactStatusListProps> => {
  return {
    statusList: state.status.statusList
  };
};

export default connect(mapStateToProps)(ContactStatusList);
