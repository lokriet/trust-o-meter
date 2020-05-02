import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import * as Yup from 'yup';

import logoImg from '../../../assets/img/suspicious.svg';
import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import Spinner from '../../UI/Spinner/Spinner';
import classes from './Register.module.scss';

interface RegisterProps {
  isLoggedIn: boolean;
  error: string | null;
  redirectPath: string;
  loading: boolean;
}

const Register = (props: RegisterProps) => {
  const [redirectPath] = useState(props.redirectPath);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.setAuthRedirectPath('/'));
    dispatch(actions.authInit());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (formValues) => {
      dispatch(
        actions.registerWithEmailAndPassword(
          formValues.email,
          formValues.password
        )
      );
    },
    [dispatch]
  );

  let form = (
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

          <Formik
            initialValues={{
              email: '',
              password: '',
              confirmPassword: ''
            }}
            validationSchema={Yup.object({
              email: Yup.string()
                .required('Email is required')
                .email('Invalid email address'),
              password: Yup.string()
                .required('Required')
                .min(6, 'Password must be at least 6 characters long'),
              confirmPassword: Yup.string()
                .required('Confirm password is required')
                .oneOf([Yup.ref('password')], "Passwords don't match")
            })}
            onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
          >
            <Form className={classes.AuthForm}>
              <Field
                className={`${classes.Input} ${classes.LoginInput}`}
                name="email"
                type="text"
                placeholder="Email"
                autoComplete="username"
              />

              <Field
                className={`${classes.Input} ${classes.PasswordInput}`}
                name="password"
                type="password"
                placeholder="Password"
                autoComplete="new-password"
              />

              <Field
                className={`${classes.Input} ${classes.ConfirmPasswordInput}`}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm password"
              />

              <ErrorMessage name="email">
                {(msg) => <div className={classes.Error}>{msg}</div>}
              </ErrorMessage>
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
                <div className="AuthButtonText">
                {props.loading ? (
                  <Spinner className="ButtonSpinner" />
                ) : (
                  'Register'
                )}
                  </div>
              </button>

              {props.error ? (
                <div className={classes.Error}>{props.error}</div>
              ) : null}

              <div className={classes.SwitchModeLink}>
                Already have an account? <Link to="/login" className="Link">Login</Link>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </div>
  );
  return props.isLoggedIn ? <Redirect to={redirectPath} /> : form;
};

const mapStateToProps = (state: State): RegisterProps => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    error: state.auth.error,
    redirectPath: state.auth.redirectPath,
    loading: state.auth.loading
  };
};

export default connect(mapStateToProps)(Register);
