import React from 'react';
import PropTypes from 'prop-types';
import classes from './SearchInput.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

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
