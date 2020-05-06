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
