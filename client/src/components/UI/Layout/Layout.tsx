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
