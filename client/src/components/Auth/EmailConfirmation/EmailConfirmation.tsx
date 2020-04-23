import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect } from 'react-router-dom';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import Spinner from '../../UI/Spinner/Spinner';

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
    dispatch(actions.sendConfirmationEmail())
  }, [dispatch]);

  let view: JSX.Element;
  if (props.waitingForEmailConfirmation) {
    if (props.resendSuccess && attemptingToResend) {
      view = <p>Email resent. Please check your inbox</p>
    } else {
      view = (
        <>
          <div>You need to confirm your email before accessing the app. <br />Please check your inbox and use the activation link provided in the email.</div>
          {props.sendingEmail ? <Spinner /> : <button type="button" onClick={handleResendConfirmationEmail}>
            Resend confirmation email
          </button>}
          {!props.sendingEmail && props.sendingError ? <Error>Resend failed. Please check your internet connection and try again</Error> : null}
        </>
      );
    }
  } else {
    view = <Redirect to="/" />;
  }
  return <div>{view}</div>;
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
