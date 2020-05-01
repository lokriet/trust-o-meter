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

  const avatarUploadedHandler = useCallback(
    (url) => {
      setAvatarUrl(url);

      onAvatarChanged(url);
      form.setFieldValue(field.name, url);
    },
    [field.name, onAvatarChanged, form]
  );

  const avatarDeletedHandler = () => {
    setAvatarUrl(null);
    onAvatarChanged(null);
    form.setFieldValue(field.name, null);
  };

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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
        return;
      }

      try {
        ImageTools.resize(
          file,
          {
            width: maxWidth,
            height: maxHeight,
          },
          (blob, didItResize, newSize) => {
            const uploadTask = firebaseApp.doUploadImage(blob, file.name);
            setIsUploading(true);
            setStatusMessage('Uploading...');
            setErrorMessage(null);

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
                    break;

                  case 'storage/unauthorized':
                    setErrorMessage('Permission denied');
                    break;

                  case 'storage/canceled':
                    setErrorMessage('Upload cancelled');
                    break;

                  case 'storage/unknown':
                  default:
                    setErrorMessage('Image upload failed');
                }
                setStatusMessage(null);
                setIsUploading(false);
                setProgress(null);
              },

              () => {
                // Upload completed successfully, now we can get the download URL
                uploadTask.snapshot.ref
                  .getDownloadURL()
                  .then(function (downloadURL) {
                    setIsUploading(false);
                    setStatusMessage(null);
                    setErrorMessage(null);
                    setProgress(null);
                    setFileName(file.name);
                    avatarUploadedHandler(downloadURL);
                  });
              }
            );
          }
        );
      } catch (error) {
        console.log(error);
        setErrorMessage('Image upload failed');
        setStatusMessage(null);
        setIsUploading(false);
        setProgress(null);
      }
    },
    [avatarUploadedHandler]
  );

  const imgSrc = avatarUrl == null || avatarUrl === '' ? defaultImg : avatarUrl;
  return (
    <div>
      <div>
        {/* <ItemsRow alignCentered> */}
        <div>
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
          {fileName && !progress ? (
            // <Popup
            //   on="hover"
            //   arrow={false}
            //   contentStyle={{width: 'auto'}}
            //   offsetY={10}
            //   trigger={<span className={classes.FileName}> {fileName}</span>}
            // >
            <div>{fileName}</div>
          ) : // </Popup>
          null}
          {/* </ItemsRow> */}
        </div>
        {statusMessage || errorMessage || isUploading ? (
          <div className={classes.Details}>
            {statusMessage ? <div>{statusMessage}</div> : null}
            {errorMessage ? <Error>{errorMessage}</Error> : null}
            {isUploading ? <progress value={progress || ''} max="100" /> : null}
          </div>
        ) : null}
      </div>

      {/* <ImageUpload
        buttonClassName={classes.Avatar}
        maxWidth={150}
        maxHeight={150}
        onUploadFinished={avatarUploadedHandler}
      >
        <img src={imgSrc} className={classes.AvatarImg} alt="avatar" />
      </ImageUpload> */}
      {avatarUrl != null && avatarUrl !== '' ? (
        <div>
          <button type="button" onClick={avatarDeletedHandler}>
            Delete avatar
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Avatar;
