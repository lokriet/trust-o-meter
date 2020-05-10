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

import {
  faCog,
  faSignOutAlt,
  faTools,
  faUserClock,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import React, { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';

import * as actions from '../../store/actions';
import { State } from '../../store/reducers/state';
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

  return (
    <div className={classes.NavigationBar}>
      <NavigationItem exact link="/" text="Home" icon={<HomeIcon />} />
      <NavigationItem
        link="/pendingContacts"
        text="Pending"
        faIcon={faUserClock}
      />
      <NavigationItem
        link="/findContacts"
        text="Add contacts"
        faIcon={faUserPlus}
      />

      <div className={classes.Spacer}></div>

      <div className={classes.Submenu}>
        <NavigationItem onClick={() => {}} icon={<ProfileIcon />} />
        <div className={classes.SubmenuList}>
          {props.isAdmin ? (
            <NavigationItem link="/admin" text="Admin" faIcon={faTools} />
          ) : null}
          <NavigationItem link="/settings" text="Settings" faIcon={faCog} />
          <NavigationItem
            link="/editProfile"
            text="Profile"
            icon={<ProfileIcon />}
          />
          <NavigationItem
            onClick={handleLogout}
            text="Logout"
            faIcon={faSignOutAlt}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: State): NavigationProps => {
  return {
    isAdmin: state.auth.isAdmin
  };
};

export default connect(mapStateToProps)(Navigation);
