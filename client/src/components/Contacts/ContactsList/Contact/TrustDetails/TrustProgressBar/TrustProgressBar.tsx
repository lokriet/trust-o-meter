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
