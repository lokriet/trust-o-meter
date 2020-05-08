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
import { faMobileAlt, faSignOutAlt, faTools, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import React, { useCallback, useContext } from 'react';
import { connect, useDispatch } from 'react-redux';

import * as actions from '../../store/actions';
import { State } from '../../store/reducers/state';
import { InstallPromptContext, InstallPromptContextValue } from '../InstallPromptContext/InstallPromptContext';
import classes from './Navigation.module.scss';
import HomeIcon from './NavigationItem/HomeIcon/HomeIcon';
import NavigationItem from './NavigationItem/NavigationItem';
import ProfileIcon from './NavigationItem/ProfileIcon/ProfileIcon';


interface NavigationProps {
  isAdmin: boolean;
}

const Navigation = (props: NavigationProps) => {
  const dispatch = useDispatch();
  const handleLogout = useCallback(() => {
    dispatch(actions.logout());
  }, [dispatch]);

  const installPromptValues: InstallPromptContextValue = useContext(
    InstallPromptContext
  );

  const handleInstallClicked = useCallback(() => {
    installPromptValues.installPrompt.prompt();
    // Wait for the user to respond to the prompt
    installPromptValues.installPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
          installPromptValues.setShowInstallButton(false);
        } else {
          console.log('App not installed');
        }
      })
      .catch((error) => {
        console.log('Failed to install app', error);
      });
  }, [installPromptValues]);

  console.log('navigation', installPromptValues.showInstallButton);
  return (
    <div className={classes.NavigationBar}>
      <NavigationItem exact link="/" text="Home" icon={<HomeIcon />} />
      <NavigationItem
        link="/findContacts"
        text="Add contacts"
        faIcon={faUserPlus}
      />
      {props.isAdmin ? (
        <NavigationItem link="/admin" text="Admin" faIcon={faTools} />
      ) : null}
      <NavigationItem
        link="/editProfile"
        text="Profile"
        icon={<ProfileIcon />}
      />
      {installPromptValues.installPrompt &&
      installPromptValues.showInstallButton ? (
        <NavigationItem
          onClick={handleInstallClicked}
          text="Add to Home screen"
          faIcon={faMobileAlt}
        />
      ) : null}
      <div className={classes.Spacer}></div>
      <NavigationItem
        onClick={handleLogout}
        text="Logout"
        faIcon={faSignOutAlt}
      />
    </div>
  );
};

const mapStateToProps = (state: State): NavigationProps => {
  return {
    isAdmin: state.auth.isAdmin
  };
};

export default connect(mapStateToProps)(Navigation);
