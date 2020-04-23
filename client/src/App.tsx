import './App.css';

import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Redirect, Route, Switch, withRouter } from 'react-router-dom';

import ConfirmEmail from './components/Auth/EmailConfirmation/ConfirmEmail';
import EmailConfirmation from './components/Auth/EmailConfirmation/EmailConfirmation';
import Login from './components/Auth/Login/Login';
import PasswordResetRequest from './components/Auth/PasswordResest/PasswordResetRequest';
import Register from './components/Auth/Register/Register';
import FindContacts from './components/Contacts/FindContacts/FindContacts';
import Home from './components/Home/Home';
import EditProfile from './components/Profile/EditProfile/EditProfile';
import Spinner from './components/UI/Spinner/Spinner';
import * as actions from './store/actions';
import { State } from './store/reducers/state';
import PasswordReset from './components/Auth/PasswordResest/PasswordReset';

interface AppProps {
  location: any;
  isLoggedIn: boolean;
  initialAuthCheckDone: boolean;
  waitingForEmailConfirmation: boolean;
  profileInitialized: boolean;
  profileLoaded: boolean;
}

const App = (props: AppProps): JSX.Element => {
  const dispatch = useDispatch();

  // authenticate
  useEffect(() => {
    if (!props.isLoggedIn && !props.initialAuthCheckDone) {
      dispatch(actions.checkInitialAuthState());
    }
  }, [props.isLoggedIn, props.initialAuthCheckDone, dispatch]);

  // // contacts init
  // useEffect(() => {
  //   if (
  //     props.isLoggedIn &&
  //     props.profileInitialized
  //   ) {
  //     dispatch(actions.fetchUserContacts());
  //   }
  // }, [
  //   dispatch,
  //   props.isLoggedIn,
  //   props.profileInitialized,
  // ]);

  let view: JSX.Element;
  let redirect: JSX.Element | null = null;
  if (
    !props.initialAuthCheckDone ||
    (props.isLoggedIn &&
      !props.profileLoaded)
  ) {
    view = <Spinner />;
  } else {
    view = (
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/editProfile" component={EditProfile} />
        <Route path="/findContacts" component={FindContacts} />
        <Route path="/emailConfirmation" component={EmailConfirmation} />
        <Route path="/activateAccount/:activationToken" component={ConfirmEmail} />
        {props.isLoggedIn ? null : <Route path="/requestPasswordReset" component={PasswordResetRequest} />}
        {props.isLoggedIn ? null : <Route path="/resetPassword/:resetPasswordToken" component={PasswordReset} />}
      </Switch>
    );
  }

  if (props.isLoggedIn && !props.location.pathname.startsWith('/activateAccount/')) {
    if (props.waitingForEmailConfirmation) {
      console.log('redirecting');
      redirect = <Redirect to="/emailConfirmation" />;
    } else if (!props.profileInitialized) {
      console.log('redirecting');
      redirect = <Redirect to="/editProfile" />;
    }
  }

  return (
    <>
      {view} 
      {redirect}
    </>
  );
};

const mapStateToProps = (state: State): Partial<AppProps> => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    initialAuthCheckDone: state.auth.initialCheckDone,
    profileLoaded: state.profile.profile != null,
    profileInitialized:
      state.profile.profile != null && state.profile.profile.initialized !== undefined && state.profile.profile.initialized,
    waitingForEmailConfirmation: state.auth.waitingForEmailConfirmation
  };
};

export default connect(mapStateToProps)(withRouter(App));
