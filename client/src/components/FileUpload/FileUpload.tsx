import React, { useRef } from 'react';
import PropTypes from 'prop-types';

const FileUpload = (props: any) => {
  const fileInput: any = useRef();

  const handleSubmit = event => {
    event.preventDefault();
    const file = fileInput.current.files[0];
    console.log(`Selected file - ${file.name}`);
    props.onUpload(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Upload file:
        <input type="file" ref={fileInput} />
      </label>
      <br />
      <button type="submit">Upload</button>
    </form>
  );
};


FileUpload.propTypes = {
  onUpload: PropTypes.func.isRequired
};

export default FileUpload;
