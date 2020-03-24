import React from 'react';
import logo from './logo.svg';
import './App.css';
import { StitchAuthProvider, useStitchAuth } from './components/Stitch/StitchAuth';

 const App = () => {
  let {
    isLoggedIn,
    actions: { handleLogout } = { handleLogout: () => {}},
  } = useStitchAuth();
  
  return (
    <StitchAuthProvider>
      {isLoggedIn ? <div>HI!</div> : <div>pls login</div>}
    </StitchAuthProvider>
  );
}

export default App;
