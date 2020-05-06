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
import React, { useCallback, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';

import withAuthCheck from '../../hoc/withAuthCheck';
import * as actions from '../../store/actions';
import { Action, Status } from '../../store/model/status';
import { State } from '../../store/reducers/state';
import { Error } from '../UI/Error/Error';
import Spinner from '../UI/Spinner/Spinner';
import AddStatus from './AddStatus/AddStatus';
import classes from './Admin.module.scss';
import EditStatus from './EditStatus/EditStatus';


interface AdminProps {
  statusList: Status[];
  loadingStatusList: boolean;
  loadingError: string | null;
  statusErrors: any;
  actionErrors: any;
}

const Admin = (props: AdminProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.fetchStatusList());
  }, [dispatch]);

  const validateExistingStatus = useCallback(
    (
      statusId: string | null,
      statusUpdate: { name: string; minTrust: number }
    ): string | null => {
      let validationError: string | null = null;
      props.statusList.forEach((status: Status) => {
        if (status._id !== statusId) {
          if (status.name === statusUpdate.name) {
            validationError = 'Status with this name already exists';
          }
          if (status.minTrust === statusUpdate.minTrust) {
            validationError =
              'Status with this minimal trust value already exists';
          }
        }
      });
      return validationError;
    },
    [props.statusList]
  );

  const validateExistingAction = useCallback(
    (
      statusId: string,
      actionId: string | null,
      actionName: string
    ): string | null => {
      let validationError: string | null = null;

      const status = props.statusList.find((status: Status) => status._id === statusId);
      if (!status) {
        return 'Internal error occurred. Please try again';
      }
      
      status.actions.forEach((action: Action) => {
        if (action._id !== actionId) {
          if (action.name === actionName) {
            validationError = 'Action with this name already exists in status';
          }
        }
      });
      return validationError;
    },
    [props.statusList]
  );

  let view: JSX.Element;
  if (props.loadingStatusList) {
    view = <Spinner />;
  } else {
    view = (
      <div className={classes.Container}>
        <div className={classes.PageTitle}>Trust status progression</div>
        {props.loadingError ? <Error>{props.loadingError}</Error> : null}
        <AddStatus
          error={props.statusErrors.ADD}
          validateExistingStatus={validateExistingStatus}
        />
        {props.statusList.map((status: Status) => (
          <EditStatus
            key={status._id}
            status={status}
            error={props.statusErrors[status._id]}
            actionErrors={props.actionErrors[status._id]}
            validateExistingStatus={validateExistingStatus}
            validateExistingAction={validateExistingAction}
          />
        ))}
      </div>
    );
  }
  return view;
};

Admin.propTypes = {};

const mapStateToProps = (state: State): AdminProps => {
  return {
    statusList: state.status.statusList,
    loadingStatusList: state.status.loading,
    loadingError: state.status.error,
    statusErrors: state.status.statusErrors,
    actionErrors: state.status.actionErrors
  };
};

export default connect(mapStateToProps)(withAuthCheck(Admin));
