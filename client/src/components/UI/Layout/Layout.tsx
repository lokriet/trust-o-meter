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
import React from 'react';
import { connect } from 'react-redux';

import { State } from '../../../store/reducers/state';
import Navigation from '../../Navigation/Navigation';
import classes from './Layout.module.scss';

 
interface LayoutProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  initialAuthCheckDone: boolean;
  waitingForEmailConfirmation: boolean;
  profileInitialized: boolean;
  profileLoaded: boolean;
  children: any;
}

const Layout = (props: LayoutProps) => {
  return props.isLoggedIn && !props.waitingForEmailConfirmation ? (
    <div className={classes.Container}>
      {/* {props.profileInitialized ? <Navigation /> : null} */}
      <Navigation />
      <div className={classes.Content}>{props.children}</div>
    </div>
  ) : (
    <>{props.children}</>
  );
};

Layout.propTypes = {};

const mapStateToProps = (state: State): Partial<LayoutProps> => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    isAdmin: state.auth.isAdmin,
    initialAuthCheckDone: state.auth.initialCheckDone,
    profileLoaded: state.profile.profile != null,
    profileInitialized:
      state.profile.profile != null &&
      state.profile.profile.initialized !== undefined &&
      state.profile.profile.initialized,
    waitingForEmailConfirmation: state.auth.waitingForEmailConfirmation
  };
};

export default connect(mapStateToProps)(Layout);
