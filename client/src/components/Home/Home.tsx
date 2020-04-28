import React from 'react';
import { connect } from 'react-redux';

import withAuthCheck from '../../hoc/withAuthCheck';
import { State } from '../../store/reducers/state';
import ContactsList from '../Contacts/ContactsList/ContactsList';

interface HomeProps {
  isLoggedIn: boolean
}

const Home = (props: HomeProps) => {
  return props.isLoggedIn ? <ContactsList /> : <div></div>;

};

const mapStateToProps = (state: State): HomeProps => {
  return {
    isLoggedIn: state.auth.isLoggedIn
  };
};

export default connect(mapStateToProps)(withAuthCheck(Home));
