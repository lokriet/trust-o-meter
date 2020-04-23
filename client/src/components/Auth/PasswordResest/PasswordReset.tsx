import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import * as Yup from 'yup';

import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import classes from './PasswordReset.module.css';

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
        <p>Please login to the application with your new password</p>
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
              .required('Required')
              .min(6, 'Must be at least 6 characters long'),
            confirmPassword: Yup.string()
              .required('Required')
              .oneOf([Yup.ref('password')], "Passwords don't match")
          })}
          onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
        >
          <Form className={classes.Form}>
            <Field
              name="password"
              type="password"
              placeholder="New password"
              autoComplete="new-password"
              // component={FormikInput}
            />
            <Error>
              <ErrorMessage name="password" />
            </Error>

            <Field
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm password"
              // component={FormikInput}
            />
            <Error>
              <ErrorMessage name="confirmPassword" />
            </Error>

            {props.error ? <Error>{props.error}</Error> : null}

            <button type="submit" disabled={props.loading}>
              Change password
            </button>
          </Form>
        </Formik>
      </>
    );
  }
  return view;
};

const mapStateToProps = (state: State): PasswordResetProps => {
  return {
    error: state.auth.error,
    loading: state.auth.loading,
    resetSuccess: state.auth.passwordReset
  };
};

export default connect(mapStateToProps)(PasswordReset);
