import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';

import logoImg from '../../../assets/img/suspicious.svg';
import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import Spinner from '../../UI/Spinner/Spinner';
import classes from './PasswordReset.module.scss';
import { Link } from 'react-router-dom';

interface PasswordResetProps {
  error: string | null;
  loading: boolean;
  resetSuccess: boolean;
}

const PasswordReset = (props: PasswordResetProps) => {
  const { resetPasswordToken } = useParams();
  const [requestSent, setRequestSent] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.authInit());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (formValues) => {
      setRequestSent(true);
      dispatch(actions.resetPassword(formValues.password, resetPasswordToken));
    },
    [dispatch, resetPasswordToken]
  );

  let view: JSX.Element;
  if (requestSent && props.resetSuccess) {
    view = (
      <>
        <h1>Password changed successfully</h1>
        <p>Please <Link to="/login">login</Link> to the application with your new password</p>
      </>
    );
  } else {
    view = (
      <>
        <Formik
          initialValues={{
            password: '',
            confirmPassword: ''
          }}
          validationSchema={Yup.object({
            password: Yup.string()
              .required('Password is required')
              .min(6, 'Password must be at least 6 characters long'),
            confirmPassword: Yup.string()
              .required('Confirm password is required')
              .oneOf([Yup.ref('password')], "Passwords don't match")
          })}
          onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
        >
          <Form>
            <Field
              className={`${classes.Input} ${classes.PasswordInput}`}
              name="password"
              type="password"
              placeholder="New password"
              autoComplete="new-password"
            />

            <Field
              className={`${classes.Input} ${classes.ConfirmPasswordInput}`}
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm password"
            />

            <ErrorMessage name="password">
              {(msg) => <div className={classes.Error}>{msg}</div>}
            </ErrorMessage>
            <ErrorMessage name="confirmPassword">
              {(msg) => <div className={classes.Error}>{msg}</div>}
            </ErrorMessage>

            <button
              type="submit"
              disabled={props.loading}
              className={classes.AuthButton}
            >
              <div className="AuthButtonText">Change password</div>
            </button>

            <Link to="/login" className="Button">
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

            {props.loading ? <Spinner className={classes.AuthSpinner} /> : null}
          </Form>
        </Formik>
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

const mapStateToProps = (state: State): PasswordResetProps => {
  return {
    error: state.auth.error,
    loading: state.auth.loading,
    resetSuccess: state.auth.passwordReset
  };
};

export default connect(mapStateToProps)(PasswordReset);
