/*
 * Copyright (C) 2020 Evgenia Lazareva
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
          // console.log('redirecting to email confirmation', location.pathname);
          history.push('/emailConfirmation');
        } else if (
          !props.waitingForEmailConfirmation &&
          props.profileLoaded &&
          !props.profileInitialized &&
          !location.pathname.startsWith('/editProfile')
        ) {
          // console.log('redirecting to edit');
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
