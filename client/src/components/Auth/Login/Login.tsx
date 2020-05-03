import { faFacebookSquare, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from 'react-google-login';
import { connect, useDispatch } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import * as Yup from 'yup';

import logoImg from '../../../assets/img/suspicious.svg';
import * as actions from '../../../store/actions';
import { State } from '../../../store/reducers/state';
import Spinner from '../../UI/Spinner/Spinner';
import classes from './Login.module.scss';

interface LoginProps {
  isLoggedIn: boolean;
  error: string | null;
  redirectPath: string;
  loading: boolean;
}

enum LoginWith {
  Email,
  Google,
  Facebook
}

const Login = (props: LoginProps) => {
  const [redirectPath] = useState(props.redirectPath);
  const [googleError, setGoogleError] = useState(false);
  const [facebookError, setFacebookError] = useState(false);
  const [loginWith, setLoginWith] = useState<LoginWith | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setGoogleError(false);
    setFacebookError(false);
    dispatch(actions.setAuthRedirectPath('/'));
    dispatch(actions.authInit());
  }, [dispatch]);

  const handleSubmit = useCallback(
    (formValues) => {
      setLoginWith(LoginWith.Email);
      dispatch(
        actions.loginWithEmailAndPassword(formValues.email, formValues.password)
      );
    },
    [dispatch]
  );

  const handleGoogleLoginSuccess = useCallback(
    (response: any) => {
      setGoogleError(false);
      setFacebookError(false);
      dispatch(actions.loginWithGoogle(response.tokenId, () => setLoading(false)));
    },
    [dispatch]
  );

  const handleGoogleLoginError = useCallback((response: any) => {
    console.log(response);
    setGoogleError(true);
    setFacebookError(false);
  }, []);

  const handleFacebookLoginSuccess = useCallback(
    (response: any) => {
      setGoogleError(false);
      setFacebookError(false);
      dispatch(
        actions.loginWithFacebook(response.userID, response.accessToken, () => setLoading(false))
      );
      // console.log(response);
    },
    [dispatch]
  );

  const handleFacebookLoginError = useCallback((response: any) => {
    console.log(response);
    setGoogleError(false);
    setFacebookError(true);
  }, []);

  const handleGoogleLoginClick = useCallback((renderProps: any) => {
    setLoading(true);
    setLoginWith(LoginWith.Google);
    renderProps.onClick();
  }, []);

  const handleFacebookLoginClick = useCallback((event: any, renderProps: any) => {
    setLoading(true);
    setLoginWith(LoginWith.Facebook);
    renderProps.onClick(event);
  }, []);

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

          <GoogleLogin
            clientId="695540773830-ji5ld1tf3aprsgdd49fveaonq3mko2u4.apps.googleusercontent.com"
            buttonText="Login"
            onSuccess={handleGoogleLoginSuccess}
            onFailure={handleGoogleLoginError}
            cookiePolicy={'single_host_origin'}
            isSignedIn={false}
            render={(renderProps) => (
              <button
                onClick={() => handleGoogleLoginClick(renderProps)}
                disabled={renderProps.disabled || props.loading}
                className={classes.AuthButton}
              >
                <FontAwesomeIcon
                  icon={faGoogle}
                  className={classes.GoogleIcon}
                />
                <div className={classes.AuthButtonText}>
                  {(props.loading || loading) && loginWith === LoginWith.Google ? (
                    <Spinner className="ButtonSpinner" />
                  ) : (
                    ' Login with Google'
                  )}
                </div>
              </button>
            )}
          />
          {googleError ? (
            <div className={classes.Error}>
              Login with Google failed. Please try again
            </div>
          ) : null}
          <FacebookLogin
            appId="231998444544391"
            autoLoad={false}
            fields="name"
            callback={handleFacebookLoginSuccess}
            onFailure={handleFacebookLoginError}
            render={(renderProps) => (
              <button
                type="button"
                onClick={(event) => handleFacebookLoginClick(event, renderProps)}
                className={classes.AuthButton}
                disabled={props.loading}
              >
                <FontAwesomeIcon
                  icon={faFacebookSquare}
                  className={classes.FacebookIcon}
                />
                <div className={classes.AuthButtonText}>
                  {(props.loading || loading) && loginWith === LoginWith.Facebook ? (
                    <Spinner className="ButtonSpinner" />
                    ) : (
                      ' Login with Facebook'
                  )}
                </div>
              </button>
            )}
          />

          {facebookError ? (
            <div className={classes.Error}>
              Login with Facebook failed. Please try again
            </div>
          ) : null}

          <div className={classes.Or}>
            <span>or</span>
          </div>
          <Formik
            initialValues={{
              email: '',
              password: ''
            }}
            validationSchema={Yup.object({
              email: Yup.string()
                .required('Email is required')
                .email('Invalid email address'),
              password: Yup.string()
                .required('Required')
                .min(6, 'Password must be at least 6 characters long')
            })}
            onSubmit={(values, { setSubmitting }) => handleSubmit(values)}
          >
            {(form) => (
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
                  autoComplete="current-password"
                />
                <div className={classes.ForgotPasswordLink}>
                  <Link
                    to={`/requestPasswordReset?email=${form.values.email}`}
                    className="Link"
                  >
                    Forgot password?
                  </Link>
                </div>

                <ErrorMessage name="email">
                  {(msg) => <div className={classes.Error}>{msg}</div>}
                </ErrorMessage>
                <ErrorMessage name="password">
                  {(msg) => <div className={classes.Error}>{msg}</div>}
                </ErrorMessage>

                <button
                  type="submit"
                  disabled={props.loading}
                  className={classes.AuthButton}
                >
                  <div className="AuthButtonText">
                    {props.loading && loginWith === LoginWith.Email ? (
                      <Spinner className="ButtonSpinner" />
                    ) : (
                      'Login'
                    )}
                  </div>
                </button>

                {props.error ? (
                  <div className={classes.Error}>{props.error}</div>
                ) : null}

                <div className={classes.SwitchModeLink}>
                  {"Don't have an account? "}
                  <Link to="/register" className="Link">
                    Register
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );

  //console.log(`is logged in ${props.isLoggedIn} redirect path ${redirectPath}`);
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
