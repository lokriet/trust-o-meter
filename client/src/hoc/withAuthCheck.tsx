import React, { useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Spinner from '../components/UI/Spinner/Spinner';
import * as actions from '../store/actions';
import { State } from '../store/reducers/state';

interface AuthCheckProps {
  isLoggedIn: boolean;
  initialAuthCheckDone: boolean;
}

const withAuthCheck = (WrappedComponent) => {
  return connect(mapStateToProps)((props: any) => {
    const dispatch = useDispatch();
    const history = useHistory();

    useEffect(() => {
      if (!props.isLoggedIn && props.initialAuthCheckDone) {
        dispatch(actions.setAuthRedirectPath(history.location.pathname + history.location.search));
        history.push('/login');
      }
    }, [dispatch, history, props.isLoggedIn, props.initialAuthCheckDone]);


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
    initialAuthCheckDone: state.auth.initialCheckDone
  };
};

export default withAuthCheck;
