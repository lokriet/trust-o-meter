import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

import logoImg from '../../../assets/img/suspicious.svg';
import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import Spinner from '../../UI/Spinner/Spinner';
import classes from './PasswordResetRequest.module.scss';

interface PasswordResetRequestProps {
  error: string | null;
  loading: boolean;
  requestSuccess: boolean;
}

const PasswordResetRequest = (props: PasswordResetRequestProps) => {
  const [query] = useState(new URLSearchParams(useLocation().search));
  const [requestSent, setRequestSent] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.authInit());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (formValues) => {
      setRequestSent(true);
      dispatch(actions.requestPasswordReset(formValues.email));
    },
    [dispatch]
  );

  let view: JSX.Element;
  if (requestSent && props.requestSuccess) {
    view = (
      <>
        <h1>Email sent</h1>
        <p>
          Please check your inbox for the instructions about how to complete the
          process.
        </p>
        <Link to="/login" className={classes.AuthButton}>
          <div className="AuthButtonText">Return to login page</div>
        </Link>
      </>
    );
  } else {
    view = (
      <div>
        <h1>Reset your password</h1>
        <p>To reset your password, enter your email below and submit.</p>
        <p>
          An email will be sent to you with instructions about how to complete
          the process.
        </p>
        <Formik
          initialValues={{
            email: query.get('email')
          }}
          validationSchema={Yup.object({
            email: Yup.string()
              .required('Email is required')
              .email('Invalid email address')
          })}
          onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
        >
          <Form>
            <Field
              className={`${classes.Input} ${classes.EmailInput}`}
              name="email"
              type="text"
              placeholder="Email"
              autoComplete="username"
            />
            <ErrorMessage name="email">
              {(msg) => <div className={classes.Error}>{msg}</div>}
            </ErrorMessage>

            <button
              type="submit"
              disabled={props.loading}
              className={classes.AuthButton}
            >
              <div className="AuthButtonText">
                {props.loading ? (
                  <Spinner className="ButtonSpinner" />
                ) : (
                  'Reset password'
                )}
              </div>
            </button>

            <Link to="/login">
              <button
                type="button"
                disabled={props.loading}
                className={classes.AuthButton}
              >
                <div className="AuthButtonText">Cancel</div>
              </button>
            </Link>

            {props.error ? (
              <div className={classes.Error}>{props.error}</div>
            ) : null}
          </Form>
        </Formik>
      </div>
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

const mapStateToProps = (state: State): PasswordResetRequestProps => {
  return {
    error: state.auth.error,
    loading: state.auth.loading,
    requestSuccess: state.auth.resetPasswordEmailSent
  };
};

export default connect(mapStateToProps)(PasswordResetRequest);
