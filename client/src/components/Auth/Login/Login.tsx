import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import { connect, useDispatch } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import * as Yup from 'yup';

import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import { Error } from '../../UI/Error/Error';
import classes from './Login.module.css';

interface LoginProps {
  isLoggedIn: boolean;
  error: string | null;
  redirectPath: string;
  loading: boolean;
}

const Login = (props: LoginProps) => {
  const [redirectPath] = useState(props.redirectPath);
  const [googleError, setGoogleError] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setGoogleError(false);
    dispatch(actions.setAuthRedirectPath('/'));
    dispatch(actions.authInit());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (formValues) => {
      dispatch(
        actions.loginWithEmailAndPassword(formValues.email, formValues.password)
      );
    },
    [dispatch]
  );

  const handleGoogleLoginSuccess = useCallback(
    (response: any) => {
      setGoogleError(false);
      dispatch(actions.loginWithGoogle(response.tokenId));
    },
    [dispatch]
  );

  const handleGoogleLoginError = useCallback((response: any) => {
    console.log(response);
    setGoogleError(true);
  }, []);

  let form = (
    <Formik
      initialValues={{
        email: '',
        password: ''
      }}
      validationSchema={Yup.object({
        email: Yup.string().required('Required').email('Invalid email address'),
        password: Yup.string()
          .required('Required')
          .min(6, 'Must be at least 6 characters long')
      })}
      onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
    >
      {
        form => 
        <Form className={classes.LoginForm}>
          <Field
            name="email"
            type="text"
            placeholder="E-mail"
            autoComplete="username"
          />
          <Error>
            <ErrorMessage name="email" />
          </Error>

          <Field
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
          />
          <Error>
            <ErrorMessage name="password" />
          </Error>

          <Link to={`/requestPasswordReset?email=${form.values.email}`}>Forgot password?</Link>

          {props.error ? <Error>{props.error}</Error> : null}
          {googleError ? (
            <Error>Login with google failed. Please try again</Error>
          ) : null}

          <button type="submit" disabled={props.loading}>
            Login
          </button>

          <GoogleLogin
            clientId="695540773830-ji5ld1tf3aprsgdd49fveaonq3mko2u4.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={handleGoogleLoginSuccess}
            onFailure={handleGoogleLoginError}
            cookiePolicy={'single_host_origin'}
            isSignedIn={false}
          />
          <div>
            Don't have an account?
            <Link to='/register'>Register</Link>
          </div>
        </Form>
      }
    </Formik>
  );

  return props.isLoggedIn ? <Redirect to={redirectPath} /> : form;
};

const mapStateToProps = (state: State): LoginProps => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    error: state.auth.error,
    redirectPath: state.auth.redirectPath,
    loading: state.auth.loading
  };
};

export default connect(mapStateToProps)(Login);