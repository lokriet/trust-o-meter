import React from 'react';

import classes from './Error.module.scss';

export const Error = (props) => {
  return (
    <div className={`${classes.Error} ${props.className || ''}`}>
      {props.children}
    </div>
  )
}
