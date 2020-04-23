import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import * as Yup from 'yup';

import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import classes from './Register.module.css';

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
      dispatch(actions.registerWithEmailAndPassword(formValues.email, formValues.password));
    },
    [dispatch]
  );

  let form = (
    <Formik
      initialValues={{
        email: '',
        password: '',
        confirmPassword: ''
      }}
      validationSchema={Yup.object({
        email: Yup.string()
          .required('Required')
          .email('Invalid email address'),
        password: Yup.string()
          .required('Required')
          .min(6, 'Must be at least 6 characters long'),
        confirmPassword: Yup.string()
          .required('Required')
          .oneOf([Yup.ref('password')], "Passwords don't match")
      })}
      onSubmit={(values, { setSubmitting }) =>
        handleSubmit(values)
      }
    >
      <Form className={classes.RegisterForm}>
        <Field
          name="email"
          type="text"
          placeholder="E-mail"
          autoComplete="username"
          // component={FormikInput}
        />
        <Error><ErrorMessage name="email" /></Error>

        <Field
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          // component={FormikInput}
        />
        <Error><ErrorMessage name="password" /></Error>

        <Field
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm password"
          // component={FormikInput}
        />
        <Error><ErrorMessage name="confirmPassword" /></Error>

        {props.error ? <Error>{props.error}</Error> : null}

        <button type="submit" disabled={props.loading}>
          Register
        </button>

        <div>
          Already have an account?
          <Link to="/login">Login</Link>
        </div>
      </Form>
    </Formik>
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
