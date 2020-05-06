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
 
const hasBlobConstructor = typeof (Blob) !== 'undefined' && (function () {
  try {
      return Boolean(new Blob());
  } catch (e) {
      return false;
  }
}());

const hasArrayBufferViewSupport = hasBlobConstructor && typeof (Uint8Array) !== 'undefined' && (function () {
  try {
      return new Blob([new Uint8Array(100)]).size === 100;
  } catch (e) {
      return false;
  }
}());

const hasToBlobSupport = (typeof HTMLCanvasElement !== 'undefined' ? HTMLCanvasElement.prototype.toBlob : false);

const hasBlobSupport = (hasToBlobSupport ||
  (typeof Uint8Array !== 'undefined' && typeof ArrayBuffer !== 'undefined' && typeof atob !== 'undefined'));

const hasReaderSupport = (typeof FileReader !== 'undefined' || typeof URL !== 'undefined');

export default class ImageTools {

  static resize(file, maxDimensions, callback) {
    //   if (typeof maxDimensions === 'function') {
    //       callback = maxDimensions;
    //       maxDimensions = {
    //           width: 640,
    //           height: 480
    //       };
    //   }


      if (!ImageTools.isSupported() || !file.type.match(/image.*/)) {
          callback(file, false);
          return false;
      }

      if (file.type.match(/image\/gif/)) {
          // Not attempting, could be an animated gif
          callback(file, false);
          return false;
      }

      const image = document.createElement('img');

      image.onload = (imgEvt) => {
          let width = image.width;
          let height = image.height;
          let isTooLarge = false;

          if (width > maxDimensions.width) {
            isTooLarge = true;
          }
          if (height > maxDimensions.height) {
            isTooLarge = true;
        }

          if (!isTooLarge) {
              callback(file, false, {width, height});
              return;
          }

          const scaleRatio = Math.min(maxDimensions.width / width, maxDimensions.height / height);

          width *= scaleRatio;
          height *= scaleRatio;

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(image, 0, 0, width, height);
          }

          if (hasToBlobSupport) {
              canvas.toBlob((blob) => {
                  callback(blob, true, {width, height});
              }, file.type);
          } else {
              const blob = ImageTools._toBlob(canvas, file.type);
              callback(blob, true, {width, height});
          }
      };
      ImageTools._loadImage(image, file, null);

      return true;
  }

  static _toBlob(canvas, type) {
      const dataURI = canvas.toDataURL(type);
      const dataURIParts = dataURI.split(',');
      let byteString;
      if (dataURIParts[0].indexOf('base64') >= 0) {
          // Convert base64 to raw binary data held in a string:
          byteString = atob(dataURIParts[1]);
      } else {
          // Convert base64/URLEncoded data component to raw binary data:
          byteString = decodeURIComponent(dataURIParts[1]);
      }
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i += 1) {
          intArray[i] = byteString.charCodeAt(i);
      }

      const mimeString = dataURIParts[0].split(':')[1].split(';')[0];
      let blob : Blob | null = null;

      if (hasBlobConstructor) {
          blob = new Blob(
              [hasArrayBufferViewSupport ? intArray : arrayBuffer],
              { type: mimeString }
          );
      } else {
          blob = new Blob([arrayBuffer]);
      }
      return blob;
  }

  static _loadImage(image, file, callback) {
      if (typeof (URL) === 'undefined') {
          const reader = new FileReader();
          reader.onload = function (evt: ProgressEvent<FileReader>) {
              image.src = evt.target?.result;
              if (callback) { callback(); }
          };
          reader.readAsDataURL(file);
      } else {
          image.src = URL.createObjectURL(file);
          if (callback) {
              callback();
          }
      }
  };

  static _toFile = (theBlob, fileName) => {
      const b = theBlob;
      b.lastModifiedDate = new Date();
      b.name = fileName;
      return theBlob;
  }

  static isSupported() {
      return (
          (typeof (HTMLCanvasElement) !== 'undefined')
          && hasBlobSupport
          && hasReaderSupport
      );
  }
}