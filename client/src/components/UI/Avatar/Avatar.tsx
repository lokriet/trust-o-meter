import PropTypes from 'prop-types';
import React from 'react';

interface AvatarProps {
  avatarUrl: string;
  username: string;
}

const Avatar = (props: AvatarProps) => {
  return (
    <div>
      {props.avatarUrl == null || props.avatarUrl === '' ? null : (
        <img src={props.avatarUrl} alt={props.username} />
      )}
    </div>
  );
};

Avatar.propTypes = {
  avatarUrl: PropTypes.string,
  username: PropTypes.string
};

export default Avatar;
