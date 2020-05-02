import './ProfileIcon.scss';

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import defaultProfileImage from '../../../../assets/img/avatar.jpg';
import { Profile } from '../../../../store/model/profile';
import { State } from '../../../../store/reducers/state';

interface ProfileIconProps {
  profile: Profile | null;
  active: boolean;
}

const ProfileIcon = (props: ProfileIconProps) => {
  const profileImage =
    props.profile && props.profile.avatarUrl
      ? props.profile.avatarUrl
      : defaultProfileImage;
  return (
    <div
      className='ProfileIcon'
      style={{ backgroundImage: `url(${profileImage})` }}
    ></div>
  );
};

ProfileIcon.propTypes = {
  active: PropTypes.bool
};

const mapStateToProps = (state: State): Partial<ProfileIconProps> => {
  return {
    profile: state.profile.profile
  };
};

export default connect(mapStateToProps)(ProfileIcon);
