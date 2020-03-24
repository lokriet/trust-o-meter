import React from 'react';
import PropTypes from 'prop-types';
import {
  hasLoggedInUser,
  loginAnonymous,
  logoutCurrentUser,
  getCurrentUser
} from '../../stitch/authentication';

type ContextProps = {
  isLoggedIn: boolean,
  currentUser: any,
  actions: { 
    handleAnonymousLogin: any, 
    handleLogout: any 
  };
};

const StitchAuthContext = React.createContext<Partial<ContextProps>>({});

export const useStitchAuth = () => {
  const context = React.useContext(StitchAuthContext);
  if (!context) {
    throw new Error(`useStitchAuth must be used within a StitchAuthProvider`);
  }
  return context;
};

export const StitchAuthProvider = (props: any): JSX.Element => {
  const [authState, setAuthState] = React.useState({
    isLoggedIn: hasLoggedInUser(),
    currentUser: getCurrentUser()
  });

  const handleAnonymousLogin = async () => {
    const { isLoggedIn } = authState;
    if (!isLoggedIn) {
      const loggedInUser = await loginAnonymous();
      setAuthState({
        ...authState,
        isLoggedIn: true,
        currentUser: loggedInUser
      });
    }
  };

  const handleLogout = async () => {
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
  };

  // We useMemo to improve performance by eliminating some re-renders
  const authInfo = React.useMemo(() => {
    const { isLoggedIn, currentUser } = authState;
    const value = {
      isLoggedIn,
      currentUser,
      actions: { handleAnonymousLogin, handleLogout }
    };
    return value;
  }, [authState.isLoggedIn]);
  return (
    <StitchAuthContext.Provider value={authInfo}>
      {props.children}
    </StitchAuthContext.Provider>
  );
};
StitchAuthProvider.propTypes = {
  children: PropTypes.element
};
