import './App.css';

import { StitchUser } from 'mongodb-stitch-browser-sdk';
import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Login from './components/Auth/Login/Login';
import Register from './components/Auth/Register/Register';
import FindContacts from './components/Contacts/FindContacts/FindContacts';
import Home from './components/Home/Home';
import EditProfile from './components/Profile/EditProfile/EditProfile';
import Spinner from './components/UI/Spinner/Spinner';
import * as actions from './store/actions';
import { State } from './store/reducers/state';

interface AppProps {
  isLoggedIn: boolean;
  initialAuthCheckDone: boolean;
  user: StitchUser | null;

  initialProfileCheckDone: boolean;
  profileExists: boolean;
  profileLoadingError: string | null;
}

const App = (props: AppProps) => {
  const dispatch = useDispatch();

  // authenticate
  useEffect(() => {
    if (!props.isLoggedIn && !props.initialAuthCheckDone) {
      dispatch(actions.checkInitialAuthState());
    }
  }, [props.isLoggedIn, props.initialAuthCheckDone, dispatch]);

  // profile init
  useEffect(() => {
    if (
      props.isLoggedIn &&
      props.user &&
      !props.initialProfileCheckDone &&
      !props.profileLoadingError
    ) {
      dispatch(actions.fetchProfile(props.user.id));
    }
  }, [
    dispatch,
    props.isLoggedIn,
    props.user,
    props.initialProfileCheckDone,
    props.profileLoadingError
  ]);

  // contacts init
  useEffect(() => {
    if (props.isLoggedIn && props.initialProfileCheckDone && props.profileExists) {
      dispatch(actions.fetchUserContacts());
    }
  }, [dispatch, props.initialProfileCheckDone, props.isLoggedIn, props.profileExists]);

  let view;
  if (
    !props.initialAuthCheckDone ||
    (props.isLoggedIn &&
      !props.profileLoadingError &&
      !props.initialProfileCheckDone)
  ) {
    view = <Spinner />;
  } else if (props.profileLoadingError) {
    view = <div>Something went wrong :(</div>;
  } else if (props.isLoggedIn && !props.profileExists) {
    view = <EditProfile />;
  } else {
    view = (
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/editProfile" component={EditProfile} />
        <Route path="/findContacts" component={FindContacts} />
      </Switch>
    );
  }

  return <BrowserRouter>{view}</BrowserRouter>;
};

const mapStateToProps = (state: State): AppProps => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    initialAuthCheckDone: state.auth.initialCheckDone,
    user: state.auth.currentUser,

    initialProfileCheckDone: state.profile.initialCheckDone,
    profileExists: state.profile.profile != null,
    profileLoadingError: state.profile.error
  };
};

export default connect(mapStateToProps)(App);
