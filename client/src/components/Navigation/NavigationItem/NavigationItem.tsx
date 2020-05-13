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
import './NavigationItem.scss';

import { IconDefinition } from '@fortawesome/fontawesome-common-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';

 

interface NavigationItemProps {
  exact?: boolean;
  link?: string;
  onClick?: any;
  icon?: JSX.Element;
  faIcon?: IconDefinition;
  text?: string;
  hasNewItems?: boolean;
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
          {props.hasNewItems ? <div className='NavigationItemRedDot'></div> : null}
        </div>
      ) : null}
      {props.faIcon ? (
        <div className={`NavigationItemIcon ${props.text ? 'SpacedIcon' : ''}`}>
          <FontAwesomeIcon
            icon={props.faIcon}
            className='NavigationItemFontawesome'
          />
          {props.hasNewItems ? <div className='NavigationItemRedDot'></div> : null}
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
  text: PropTypes.string,
  hasNewItems: PropTypes.bool
};

export default NavigationItem;
