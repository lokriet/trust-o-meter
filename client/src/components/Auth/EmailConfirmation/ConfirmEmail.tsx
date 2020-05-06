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
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';

import logoImg from '../../../assets/img/suspicious.svg';
import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import Spinner from '../../UI/Spinner/Spinner';
import classes from './ConfirmEmail.module.scss';



interface ConfirmEmailProps {
  waitingForEmailConfirmation: boolean;
  loading: boolean;
  error: string | null;
  resendSuccess: boolean;
}

const ConfirmEmail = (props: ConfirmEmailProps): JSX.Element => {
  const [attemptingToResend, setAttemptingToResend] = useState(false);
  const dispatch = useDispatch();
  const { activationToken } = useParams();

  useEffect(() => {
    dispatch(actions.authInit());
  }, [dispatch]);

  useEffect(() => {
    if (props.waitingForEmailConfirmation) {
      dispatch(actions.confirmEmail(activationToken));
    }
  }, [dispatch, props.waitingForEmailConfirmation, activationToken]);

  const handleResendConfirmationEmail = useCallback(() => {
    setAttemptingToResend(true);
    dispatch(actions.sendConfirmationEmail());
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(actions.logout());
  }, [dispatch]);

  let view: JSX.Element | null = null;
  if (!props.waitingForEmailConfirmation) {
    view = <Redirect to="/" />;
  } else if (props.loading) {
    view = <Spinner />;
  } else if (props.error) {
    view = (
      <>
        <p>
          Email confirmation failed. Please check your internet connection and
          make sure you are using the latest requested link from your inbox
          before you try again.
        </p>
        <p>
          If your activation link has expired, use the button below to get a new
          one.
        </p>
        <button
          type="button"
          disabled={props.loading}
          className={classes.AuthButton}
          onClick={handleResendConfirmationEmail}
        >
          <div className="AuthButtonText">
            {props.loading && attemptingToResend ? (
              <Spinner className="ButtonSpinner" />
            ) : (
              'Resend confirmation email'
            )}
          </div>
        </button>
        <button
          type="button"
          disabled={props.loading}
          className={classes.AuthButton}
          onClick={handleLogout}
        >
          <div className="AuthButtonText">Logout</div>
        </button>

        {attemptingToResend ? (
          <div className={classes.Error}>{props.error}</div>
        ) : null}
      </>
    );
  } else if (attemptingToResend && props.resendSuccess) {
    view = (
      <>
        <p>Confirmation email resent.</p>
        <p>
          Please check your inbox and use the activation link provided in the
          email.
        </p>
        <button
          type="button"
          disabled={props.loading}
          className={classes.AuthButton}
          onClick={handleLogout}
        >
          <div className="AuthButtonText">Logout</div>
        </button>
      </>
    );
  }

  return (
    <div className={classes.AuthView}>
      <div className={classes.VerticalScrollContainer}>
        <div className={classes.Content}>
          <div className={classes.LogoContainer}>
            <img
              src={logoImg}
              alt="Trust-o-Meter"
              className={classes.LogoImage}
            />
          </div>
          {view}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: State): ConfirmEmailProps => {
  return {
    waitingForEmailConfirmation: state.auth.waitingForEmailConfirmation,
    loading: state.auth.loading,
    error: state.auth.error,
    resendSuccess: state.auth.activationEmailSent
  };
};

export default connect(mapStateToProps)(withAuthCheck(ConfirmEmail));
