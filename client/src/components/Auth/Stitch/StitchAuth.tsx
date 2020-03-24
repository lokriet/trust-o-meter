import { StitchUser } from 'mongodb-stitch-browser-sdk';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import {
  getCurrentUser,
  hasLoggedInUser,
  loginAnonymous,
  logoutCurrentUser
} from '../../../stitch/authentication';

interface AuthState {
  isLoggedIn: boolean;
  currentUser: StitchUser | null | undefined;
  actions: {
    handleAnonymousLogin: (...args: any[]) => any;
    handleLogout: (...args: any[]) => any;
  };
}

// Create a React Context that lets us expose and access auth state
// without passing props through many levels of the component tree
const StitchAuthContext = React.createContext<AuthState>({
  isLoggedIn: false,
  currentUser: null,
  actions: {
    handleAnonymousLogin: () => {},
    handleLogout: () => {}
  }
});

// Create a React Hook that lets us get data from our auth context
export function useStitchAuth() {
  const context = React.useContext(StitchAuthContext);
  if (!context) {
    throw new Error(`useStitchAuth must be used within a StitchAuthProvider`);
  }
  console.log(context);
  return context;
}

// Create a component that controls auth state and exposes it via
// the React Context we created.
export function StitchAuthProvider(props) {
  const [authState, setAuthState] = React.useState({
    isLoggedIn: hasLoggedInUser(),
    currentUser: getCurrentUser()
  });

  // Authentication Actions
  const handleAnonymousLogin = useCallback(async () => {
    const { isLoggedIn } = authState;
    if (!isLoggedIn) {
      const loggedInUser = await loginAnonymous();
      setAuthState({
        ...authState,
        isLoggedIn: true,
        currentUser: loggedInUser
      });
    }
  }, [authState]);

  const handleLogout = useCallback(async () => {
    const { isLoggedIn } = authState;
    if (isLoggedIn) {
      await logoutCurrentUser();
      setAuthState({
        ...authState,
        isLoggedIn: false,
        currentUser: null
      });
    } else {
      console.log(`can't handleLogout when no user is logged in`);
    }
  }, [authState]);

  // We useMemo to improve performance by eliminating some re-renders
  const authInfo = React.useMemo(() => {
    const { isLoggedIn, currentUser } = authState;
    const value = {
      isLoggedIn,
      currentUser,
      actions: { handleAnonymousLogin, handleLogout }
    };
    return value;
  }, [authState, handleAnonymousLogin, handleLogout]);
  // const { isLoggedIn, currentUser } = authState;
  //   const authInfo = {
  //     isLoggedIn,
  //     currentUser,
  //     actions: { handleAnonymousLogin, handleLogout }
  //   };
  return (
    <StitchAuthContext.Provider value={authInfo}>
      {props.children}
    </StitchAuthContext.Provider>
  );
}
StitchAuthProvider.propTypes = {
  children: PropTypes.element
};
