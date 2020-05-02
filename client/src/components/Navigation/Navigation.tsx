import { faSignOutAlt, faTools, faUserPlus } from '@fortawesome/free-solid-svg-icons';
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
      <NavigationItem link="/findContacts" text="Add contacts" faIcon={faUserPlus} />
      {props.isAdmin ? <NavigationItem link="/admin" text="Admin" faIcon= {faTools} /> : null}
      <NavigationItem link="/editProfile" text="Profile" icon={<ProfileIcon />} />
      <div className={classes.Spacer}></div>
      <NavigationItem onClick={handleLogout} text="Logout" faIcon={faSignOutAlt} />
    </div>
  );
};

const mapStateToProps = (state: State): NavigationProps => {
  return {
    isAdmin: state.auth.isAdmin
  };
};

export default connect(mapStateToProps)(Navigation);
