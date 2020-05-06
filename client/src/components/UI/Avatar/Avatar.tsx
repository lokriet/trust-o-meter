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
import PropTypes from 'prop-types';
import React from 'react';

import classes from './Avatar.module.scss';

 
interface AvatarProps {
  avatarUrl: string;
}

const Avatar = (props: AvatarProps) => {
  return (
    <div className={classes.Container} style={props.avatarUrl == null || props.avatarUrl === '' ? {} : {backgroundImage: `url('${props.avatarUrl}')`}}>
      {/* {props.avatarUrl == null || props.avatarUrl === '' ? null : (
        <img src={props.avatarUrl} alt={props.username} />
      )} */}
    </div>
  );
};

Avatar.propTypes = {
  avatarUrl: PropTypes.string
};

export default Avatar;
