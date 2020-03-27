import React, { useCallback } from 'react';
import withAuthCheck from '../../hoc/withAuthCheck';
import { useDispatch } from 'react-redux';
import * as actions from '../../store/actions/index';

const Home = () => {
  const dispatch = useDispatch();
  const handleLogout = useCallback(() => {
    dispatch(actions.logout());
  }, [dispatch]);

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default withAuthCheck(Home);
