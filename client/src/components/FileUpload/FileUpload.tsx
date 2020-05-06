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
import React, { useRef } from 'react';

 
const FileUpload = (props: any) => {
  const fileInput: any = useRef();

  const handleSubmit = event => {
    event.preventDefault();
    const file = fileInput.current.files[0];
    // console.log(`Selected file - ${file.name}`);
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
