/*
 * Copyright (C) 2020 Evgenia Lazareva
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import Admin from './components/Admin/Admin';
import ConfirmEmail from './components/Auth/EmailConfirmation/ConfirmEmail';
import EmailConfirmation from './components/Auth/EmailConfirmation/EmailConfirmation';
import Login from './components/Auth/Login/Login';
import PasswordReset from './components/Auth/PasswordResest/PasswordReset';
import PasswordResetRequest from './components/Auth/PasswordResest/PasswordResetRequest';
import Register from './components/Auth/Register/Register';
import ContactsList, {
  ContactListType
} from './components/Contacts/ContactsList/ContactsList';
import FindContacts from './components/Contacts/FindContacts/FindContacts';
import Home from './components/Home/Home';
import { InstallPromptContextProvider } from './components/InstallPromptContext/InstallPromptContext';
import Privacy from './components/Privacy/Privacy';
import EditProfile from './components/Profile/EditProfile/EditProfile';
import Settings from './components/Settings/Settings';
import Layout from './components/UI/Layout/Layout';
import Spinner from './components/UI/Spinner/Spinner';
import * as actions from './store/actions';
import { Profile } from './store/model/profile';
import { State } from './store/reducers/state';

interface AppProps {
  location: any;
  history: any;
  isLoggedIn: boolean;
  isAdmin: boolean;
  initialAuthCheckDone: boolean;
  waitingForEmailConfirmation: boolean;
  profile: Profile | null;
  profileInitialized: boolean;
}

const App = (props: AppProps): JSX.Element => {
  const dispatch = useDispatch();
  // const [installPrompt, showInstallButton] = useInstallPrompt();

  // authenticate
  useEffect(() => {
    if (!props.isLoggedIn && !props.initialAuthCheckDone) {
      dispatch(actions.checkInitialAuthState());
    }
  }, [props.isLoggedIn, props.initialAuthCheckDone, dispatch]);

  useEffect(() => {
    if (props.isLoggedIn && props.profile != null) {
      dispatch(actions.initSocketConnection());
    }
    return () => {
      dispatch(actions.disconnectSocket());
    };
  }, [dispatch, props.isLoggedIn, props.profile]);

  let view: JSX.Element;
  // let redirect: JSX.Element | null = null;
  if (
    !props.initialAuthCheckDone ||
    (props.isLoggedIn && props.profile == null)
  ) {
    view = <Spinner />;
  } else {
    view = (
      <Switch>
        <Route path="/" exact component={Home} />
        <Route
          path="/pendingContacts"
          render={(routeProps) => (
            <ContactsList
              listType={ContactListType.PendingContacts}
              {...routeProps}
            />
          )}
        />
        <Route path="/privacy" component={Privacy} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/editProfile" component={EditProfile} />
        <Route path="/settings" component={Settings} />
        <Route path="/findContacts" component={FindContacts} />
        <Route path="/emailConfirmation" component={EmailConfirmation} />
        <Route
          path="/activateAccount/:activationToken"
          component={ConfirmEmail}
        />
        {props.isLoggedIn ? null : (
          <Route
            path="/requestPasswordReset"
            component={PasswordResetRequest}
          />
        )}
        {props.isLoggedIn ? null : (
          <Route
            path="/resetPassword/:resetPasswordToken"
            component={PasswordReset}
          />
        )}
        {props.isAdmin ? <Route path="/admin" component={Admin} /> : null}
      </Switch>
    );
  }

  return (
    <InstallPromptContextProvider>
      <Layout>{view}</Layout>
    </InstallPromptContextProvider>
  );
};

const mapStateToProps = (state: State): Partial<AppProps> => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    isAdmin: state.auth.isAdmin,
    initialAuthCheckDone: state.auth.initialCheckDone,
    profile: state.profile.profile,
    profileInitialized:
      state.profile.profile != null &&
      state.profile.profile.initialized !== undefined &&
      state.profile.profile.initialized,
    waitingForEmailConfirmation: state.auth.waitingForEmailConfirmation
  };
};

export default connect(mapStateToProps)(withRouter(App));
