import './HomeIcon.scss';

import React from 'react';

import iconImg from '../.././../../assets/img/oneEye.svg';
import iconActiveImg from '../.././../../assets/img/oneEyeYellow.svg';

const HomeIcon = () => {
  return (
    <div className='IconContainer'>
      <img src={iconImg} alt="Trust-o-meter" className='Icon IconRegular' />
      <img src={iconActiveImg} alt="Trust-o-meter" className='Icon IconHovered' />
    </div>
  )
}

HomeIcon.propTypes = {
}

export default HomeIcon
