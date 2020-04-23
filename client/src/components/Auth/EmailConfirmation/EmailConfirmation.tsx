import React, { useCallback, useState } from 'react';
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
}

const EmailConfirmation = (props: EmailConfirmationProps): JSX.Element => {
  const [attemptingToResend, setAttemptingToResend] = useState(false);
  const dispatch = useDispatch();

  const handleResendConfirmationEmail = useCallback(() => {
    setAttemptingToResend(true);
    dispatch(actions.sendConfirmationEmail())
  }, [dispatch]);

  let view: JSX.Element;
  if (props.waitingForEmailConfirmation) {
    view = (
      <>
        <div>You need to confirm your email before accessing the app. <br />Please check your inbox and use the activation link provided in the email.</div>
        {props.sendingEmail ? <Spinner /> : <button type="button" onClick={handleResendConfirmationEmail}>
          Resend confirmation email
        </button>}
        {!props.sendingEmail && props.sendingError ? <Error>Resend failed. Please check your internet connection and try again</Error> : null}
        {!props.sendingEmail && !props.sendingError && attemptingToResend ? <p>Email resent. Please check your inbox</p> : null}
      </>
    );
  } else {
    view = <Redirect to="/" />;
  }
  return <div>{view}</div>;
};

const mapStateToProps = (state: State): EmailConfirmationProps => {
  return {
    waitingForEmailConfirmation: state.auth.waitingForEmailConfirmation,
    sendingEmail: state.auth.loading,
    sendingError: state.auth.error
  };
};

export default connect(mapStateToProps)(withAuthCheck(EmailConfirmation));
