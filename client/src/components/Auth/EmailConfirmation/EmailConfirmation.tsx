import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import logoImg from '../../../assets/img/suspicious.svg';
import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import Spinner from '../../UI/Spinner/Spinner';
import classes from './EmailConfirmation.module.scss';

interface EmailConfirmationProps {
  waitingForEmailConfirmation: boolean;
  sendingEmail: boolean;
  sendingError: string | null;
  resendSuccess: boolean;
}

const EmailConfirmation = (props: EmailConfirmationProps): JSX.Element => {
  const [attemptingToResend, setAttemptingToResend] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.authInit());
  }, [dispatch]);

  const handleResendConfirmationEmail = useCallback(() => {
    setAttemptingToResend(true);
    dispatch(actions.sendConfirmationEmail());
  }, [dispatch]);

  const handleLogout = useCallback(() => {
    dispatch(actions.logout());
  }, [dispatch]);

  let view: JSX.Element;
  if (props.waitingForEmailConfirmation) {
    if (props.resendSuccess && attemptingToResend) {
      view = (
        <>
          <p>Confirmation email resent.</p>
          <p>
            Please check your inbox and use the activation link provided in the
            email.
          </p>
          <button
            type="button"
            disabled={props.sendingEmail}
            className={classes.AuthButton}
            onClick={handleLogout}
          >
            <div className="AuthButtonText">Logout</div>
          </button>
        </>
      );
    } else {
      view = (
        <>
          <p>You need to confirm your email before accessing the app.</p>
          <p>
            Please check your inbox and use the activation link provided in the
            email.
          </p>
          <button
            type="button"
            disabled={props.sendingEmail}
            className={classes.AuthButton}
            onClick={handleResendConfirmationEmail}
          >
            <div className="AuthButtonText">
            {props.sendingEmail ? (
              <Spinner className="ButtonSpinner" />
            ) : (
              'Resend confirmation email'
            )}
            </div>
          </button>
          <button
            type="button"
            disabled={props.sendingEmail}
            className={classes.AuthButton}
            onClick={handleLogout}
          >
            <div className="AuthButtonText">Logout</div>
          </button>

          {props.sendingError ? (
            <div className={classes.Error}>{props.sendingError}</div>
          ) : null}
        </>
      );
    }
  } else {
    view = <Redirect to="/" />;
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

const mapStateToProps = (state: State): EmailConfirmationProps => {
  return {
    waitingForEmailConfirmation: state.auth.waitingForEmailConfirmation,
    sendingEmail: state.auth.loading,
    sendingError: state.auth.error,
    resendSuccess: state.auth.activationEmailSent
  };
};

export default connect(mapStateToProps)(withAuthCheck(EmailConfirmation));
