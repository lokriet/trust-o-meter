import React from 'react';

import classes from './Spinner.module.scss';

const Spinner = (props) => {
  return (
    <div className={`${classes.Spinner} ${props.className || ''}`}>
      <div className={classes.Rect1}></div>
      <div className={classes.Rect2}></div>
      <div className={classes.Rect3}></div>
      <div className={classes.Rect4}></div>
      <div className={classes.Rect5}></div>
    </div>
  );
};

export default Spinner;
