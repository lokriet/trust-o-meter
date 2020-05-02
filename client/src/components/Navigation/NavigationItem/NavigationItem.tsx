import './NavigationItem.scss';

import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';


interface NavigationItemProps {
  exact?: boolean;
  link?: string;
  onClick?: any;
  icon?: JSX.Element;
  faIcon?: IconDefinition;
  text?: string;
}

const NavigationItem = (props: NavigationItemProps) => {

  const navItemView = (
    <>
      {props.icon ? (
        // <div className={`${classes.NavigationItemIcon} ${props.text ? classes.SpacedIcon : ''}`}>
        //   {React.cloneElement(props.icon, { active: hovered })}
        // </div>
        <div className={`NavigationItemIcon ${props.text ? 'SpacedIcon' : ''}`}>
          {React.cloneElement(props.icon)}
        </div>
      ) : null}
      {props.faIcon ? (
        <div className={`NavigationItemIcon ${props.text ? 'SpacedIcon' : ''}`}>
          <FontAwesomeIcon
            icon={props.faIcon}
            className='NavigationItemFontawesome'
          />
        </div>
      ) : null}
      {props.text ? (
        <div className='NavigationItemText'>{props.text}</div>
      ) : null}
    </>
  );

  return props.link ? (
    <NavLink
      to={props.link}
      exact={props.exact}
      className='NavigationItem'
      activeClassName='ActiveNavigationItem'
    >
      {navItemView}
    </NavLink>
  ) : (
    <div
      className='NavigationItem'
      onClick={props.onClick}
    >
      {navItemView}
    </div>
  );
};

NavigationItem.propTypes = {
  exact: PropTypes.bool,
  link: PropTypes.string,
  onClick: PropTypes.any,
  icon: PropTypes.any,
  text: PropTypes.string
};

export default NavigationItem;
