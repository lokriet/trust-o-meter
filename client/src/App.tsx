import React from 'react';

import './App.css';

import {
  StitchAuthProvider,
  useStitchAuth
} from './components/Auth/Stitch/StitchAuth';
import Login from './components/Auth/Login/Login';

const App = () => {
  let { isLoggedIn, actions: {handleLogout} } = useStitchAuth();

  return isLoggedIn ? <button onClick={handleLogout}>Logout</button> : <Login />;
};

export default App;
