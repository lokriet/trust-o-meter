import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import withAuthCheck from '../../hoc/withAuthCheck';
import * as actions from '../../store/actions';

const Home = () => {
  const dispatch = useDispatch();
  const handleLogout = useCallback(() => {
    dispatch(actions.logout());
  }, [dispatch]);

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <button><Link to="/editProfile">Edit Profile</Link></button>
      <button><Link to="/findContacts">Find new contacts</Link></button>
    </div>
  );
};

export default withAuthCheck(Home);
