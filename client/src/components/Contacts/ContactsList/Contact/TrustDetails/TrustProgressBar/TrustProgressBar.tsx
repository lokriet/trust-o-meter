import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import classes from './TrustProgressBar.module.scss';

interface TrustProgressBarProps {
  trustPoints: number;
}

const maxTrustPoints = 100;

const TrustProgressBar = (props: TrustProgressBarProps) => {
  const tailLength = useCallback((): number => {
    return props.trustPoints === 0
      ? 100
      : ((maxTrustPoints - props.trustPoints) * 100) / maxTrustPoints;
  }, [props.trustPoints]);

  return (
    <div className={classes.ProgressBar}>
      <div
        className={classes.ProgressBarTail}
        style={{ width: `${tailLength()}%` }}
      ></div>
    </div>
  );
};

TrustProgressBar.propTypes = {
  trustPoints: PropTypes.number.isRequired
};

export default TrustProgressBar;
