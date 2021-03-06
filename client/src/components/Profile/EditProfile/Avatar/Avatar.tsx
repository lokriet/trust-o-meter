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
import React, { useCallback, useState } from 'react';

import defaultImg from '../../../../assets/img/avatar.jpg';
import { firebaseApp } from '../../../../firebase/firebase';
import ImageTools from '../../../../util/ImageTools';
import { Error } from '../../../UI/Error/Error';
import classes from './Avatar.module.scss';

 
const maxFileSize = 1024; //1mb
const maxWidth = 500;
const maxHeight = 500;

const Avatar = ({
  field, // { name, value, onChange, onBlur }
  form,
  ...props
}) => {
  const [avatarUrl, setAvatarUrl] = useState(field.value);
  const onAvatarChanged = props.onAvatarChanged || (() => {});
  // const onErrorMessageChanged = props.onAvatarChanged || (() => {});

  const avatarUploadedHandler = useCallback(
    (url) => {
      setAvatarUrl(url);

      onAvatarChanged(url);
      form.setFieldValue(field.name, url);
    },
    [field.name, onAvatarChanged, form]
  );

  // const avatarDeletedHandler = () => {
  //   setAvatarUrl(null);
  //   onAvatarChanged(null);
  //   form.setFieldValue(field.name, null);
  // };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number | null>(null);

  const startUploadImageHandler = useCallback(
    (event) => {
      const file = event.target.files[0];

      if (file == null) {
        return;
      }

      const fileSize = file.size / 1024;
      if (fileSize > maxFileSize) {
        const maxFileSizeString =
          maxFileSize > 1024
            ? (maxFileSize / 1024).toFixed(2) + 'M'
            : maxFileSize.toFixed(0) + 'K';
        setErrorMessage(`File size should be less than ${maxFileSizeString}`);
        // onErrorMessageChanged(`File size should be less than ${maxFileSizeString}`);
        return;
      }

      try {
        ImageTools.resize(
          file,
          {
            width: maxWidth,
            height: maxHeight
          },
          (blob, didItResize, newSize) => {
            const uploadTask = firebaseApp.doUploadImage(blob, file.name);
            setIsUploading(true);
            // setStatusMessage('Uploading...');
            setErrorMessage(null);
            // onErrorMessageChanged(null);

            uploadTask.on(
              'state_changed',
              (snapshot) => {
                setProgress(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                // switch (snapshot.state) {
                //   case 'paused':
                //     setStatusMessage('Upload is paused');
                //     break;
                //   case 'running':
                //     setStatusMessage('Uploading...');
                //     break;
                //   default:
                // do nothing
                // }
              },

              (error: any) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                  case 'storage/unauthenticated':
                    setErrorMessage('You are not logged in');
                    // onErrorMessageChanged('You are not logged in');
                    break;

                  case 'storage/unauthorized':
                    setErrorMessage('Permission denied');
                    // onErrorMessageChanged('Permission denied');
                    break;

                  case 'storage/canceled':
                    setErrorMessage('Upload cancelled');
                    // onErrorMessageChanged('Upload cancelled');
                    break;

                  case 'storage/unknown':
                  default:
                    setErrorMessage('Image upload failed');
                  // onErrorMessageChanged('Image upload failed');
                }
                // setStatusMessage(null);
                setIsUploading(false);
                setProgress(null);
              },

              () => {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref
                  .getDownloadURL()
                  .then(function (downloadURL) {
                    setIsUploading(false);
                    // setStatusMessage(null);
                    setErrorMessage(null);
                    // onErrorMessageChanged(null);
                    setProgress(null);
                    // setFileName(file.name);
                    avatarUploadedHandler(downloadURL);
                  });
              }
            );
          }
        );
      } catch (error) {
        console.log(error);
        setErrorMessage('Image upload failed');
        // setStatusMessage(null);
        setIsUploading(false);
        setProgress(null);
      }
    },
    [avatarUploadedHandler]
  );

  const imgSrc = avatarUrl == null || avatarUrl === '' ? defaultImg : avatarUrl;
  return (
    <div className={classes.Avatar}>
      <input
        type="file"
        id="file"
        name="file"
        className={classes.HiddenInput}
        onChange={startUploadImageHandler}
      />
      <label htmlFor="file" className={classes.UploadButton}>
        <img src={imgSrc} className={classes.AvatarImg} alt="avatar" />
      </label>
      {isUploading ? (
        <progress
          value={progress || ''}
          max="100"
          className={classes.ProgressBar}
        />
      ) : null}
      {errorMessage ? <Error>{errorMessage}</Error> : null}
      {/* {avatarUrl != null && avatarUrl !== '' ? (
        <div>
          <button type="button" onClick={avatarDeletedHandler}>
            Delete avatar
          </button>
        </div>
      ) : null} */}
    </div>
  );
};

export default Avatar;
