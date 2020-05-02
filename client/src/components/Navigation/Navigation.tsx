import React, { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';

import * as actions from '../../store/actions';
import { State } from '../../store/reducers/state';
import classes from './Navigation.module.scss';

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
      <NavLink to="/" exact className={classes.NavigationItem} activeClassName={classes.Active}>Home</NavLink>
      <NavLink to="/editProfile" className={classes.NavigationItem} activeClassName={classes.Active}>Edit Profile</NavLink>

      <NavLink to="/findContacts" className={classes.NavigationItem} activeClassName={classes.Active}>Find new contacts</NavLink>

      {props.isAdmin ? <NavLink to="/admin" className={classes.NavigationItem} activeClassName={classes.Active}>Admin</NavLink> : null}

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

const mapStateToProps = (state: State): NavigationProps => {
  return {
    isAdmin: state.auth.isAdmin
  };
};

export default connect(mapStateToProps)(Navigation);
