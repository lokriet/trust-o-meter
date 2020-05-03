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
