import React from 'react';
import { useStitchAuth } from '../Stitch/StitchAuth';

const Login = props => {
  const { actions } = useStitchAuth();

  return actions ? (
    <div>
      <button onClick={actions.handleAnonymousLogin}>Login</button>
    </div>
  ) : null;
};

Login.propTypes = {};

export default Login;
