import './App.css';

import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Login from './components/Auth/Login/Login';
import Register from './components/Auth/Register/Register';
import Home from './components/Home/Home';
import Spinner from './components/UI/Spinner/Spinner';
import * as actions from './store/actions';
import { State } from './store/reducers/state';

interface AppProps {
  isLoggedIn: boolean;
  initialAuthCheckDone: boolean;
}

const App = (props: AppProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!props.isLoggedIn && !props.initialAuthCheckDone) {
      dispatch(actions.checkInitialAuthState());
    }
  }, [props.isLoggedIn, props.initialAuthCheckDone, dispatch]);

  return props.initialAuthCheckDone ? (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
      </Switch>
    </BrowserRouter>
  ) : (
    <Spinner />
  );
};


const mapStateToProps = (state: State): AppProps => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    initialAuthCheckDone: state.auth.initialCheckDone
  };
};

export default connect(mapStateToProps)(App);
