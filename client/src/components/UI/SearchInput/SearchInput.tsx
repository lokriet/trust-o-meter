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
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

import classes from './SearchInput.module.scss';

 
interface SearchInputProps {
  [x: string]: any;
}

const SearchInput = (props: SearchInputProps) => {
  const { ...htmlProps } = props;

  return (
    <div className={classes.SearchBox}>
      <FontAwesomeIcon icon={faSearch} className={classes.SearchIcon} />
      <input type="text" className={classes.SearchInput} {...htmlProps} />
    </div>
  );
};

SearchInput.propTypes = {};

export default SearchInput;
