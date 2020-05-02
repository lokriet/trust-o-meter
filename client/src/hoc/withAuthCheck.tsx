import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import Spinner from '../components/UI/Spinner/Spinner';
import * as actions from '../store/actions';
import { State } from '../store/reducers/state';

interface AuthCheckProps {
  isLoggedIn: boolean;
  initialAuthCheckDone: boolean;
  waitingForEmailConfirmation: boolean;
  profileInitialized: boolean;
  profileLoaded: boolean;
}

const withAuthCheck = (WrappedComponent) => {
  return connect(mapStateToProps)((props: any) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
      if (!props.isLoggedIn && props.initialAuthCheckDone) {
        dispatch(
          actions.setAuthRedirectPath(location.pathname + location.search)
        );
        history.push('/login');
      } else if (
        props.isLoggedIn &&
        !location.pathname.startsWith('/activateAccount/')
      ) {
        if (
          props.waitingForEmailConfirmation &&
          !location.pathname.startsWith('/emailConfirmation')
        ) {
          console.log('redirecting to email confirmation', location.pathname);
          history.push('/emailConfirmation');
        } else if (
          !props.waitingForEmailConfirmation &&
          props.profileLoaded &&
          !props.profileInitialized &&
          !location.pathname.startsWith('/editProfile')
        ) {
          console.log('redirecting to edit');
          history.push('/editProfile');
        }
      }
    }, [
      dispatch,
      history,
      location,
      props.isLoggedIn,
      props.initialAuthCheckDone,
      props.profileInitialized,
      props.profileLoaded,
      props.waitingForEmailConfirmation
    ]);

    if (!props.initialAuthCheckDone) {
      return <Spinner />;
    } else {
      return <WrappedComponent {...props} />;
    }
  });
};

const mapStateToProps = (state: State): AuthCheckProps => {
  return {
    isLoggedIn: state.auth.isLoggedIn,
    initialAuthCheckDone: state.auth.initialCheckDone,
    profileLoaded: state.profile.profile != null,
    profileInitialized:
      state.profile.profile != null &&
      state.profile.profile.initialized !== undefined &&
      state.profile.profile.initialized,
    waitingForEmailConfirmation: state.auth.waitingForEmailConfirmation
  };
};

export default withAuthCheck;
