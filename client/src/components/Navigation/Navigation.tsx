import React, { useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import * as actions from '../../store/actions';
import { State } from '../../store/reducers/state';

interface NavigationProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
}

const Navigation = (props: NavigationProps) => {
  const dispatch = useDispatch();
  const handleLogout = useCallback(() => {
    dispatch(actions.logout());
  }, [dispatch]);

  return props.isLoggedIn ? (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <div>
        <Link to="/">Home</Link>
      </div>
      <div>
        <Link to="/editProfile">Edit Profile</Link>
      </div>
      <div>
        <Link to="/findContacts">Find new contacts</Link>
      </div>
      {props.isAdmin ? <div><Link to="/admin">Admin</Link></div> : null}
    </div>
  ) : <div></div>;
};

const mapStateToProps = (state: State): NavigationProps => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    isAdmin: state.auth.isAdmin
  };
};

export default connect(mapStateToProps)(Navigation);
