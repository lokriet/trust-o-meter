import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';

import withAuthCheck from '../../../hoc/withAuthCheck';
import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import Spinner from '../../UI/Spinner/Spinner';

interface ConfirmEmailProps {
  waitingForEmailConfirmation: boolean;
  loading: boolean;
  error: string | null;
}

const ConfirmEmail = (props: ConfirmEmailProps): JSX.Element => {
  const [attemptingToResend, setAttemptingToResend] = useState(false);
  const dispatch = useDispatch();
  const { activationToken } = useParams();

  useEffect(() => {
    if (props.waitingForEmailConfirmation) {
      dispatch(actions.confirmEmail(activationToken));
    }
  }, [dispatch]);

  const handleResendConfirmationEmail = useCallback(() => {
    setAttemptingToResend(true);
    dispatch(actions.sendConfirmationEmail());
  }, [dispatch]);

  let view: JSX.Element | null = null;
  if (!props.waitingForEmailConfirmation) {
    view = <Redirect to="/" />;
  } else if (props.loading) {
    view = <Spinner />;
  } else if (props.error) {
    view = (
      <>
        <div>
          Activation failed. Check your internet connection and try again. If
          your activation link timed out, use the button below to get a new one.
        </div>
        <button type="button" onClick={handleResendConfirmationEmail}>
          Resend confirmation email
        </button>
        {attemptingToResend ? (
          <Error>
            Resend failed. Please check your internet connection and try again
          </Error>
        ) : null}
      </>
    );
  } else if (attemptingToResend) {
    view = <p>Email resent. Please check your inbox</p>;
  }

  return <>{view}</>;
};

const mapStateToProps = (state: State): ConfirmEmailProps => {
  return {
    waitingForEmailConfirmation: state.auth.waitingForEmailConfirmation,
    loading: state.auth.loading,
    error: state.auth.error
  };
};

export default connect(mapStateToProps)(withAuthCheck(ConfirmEmail));
