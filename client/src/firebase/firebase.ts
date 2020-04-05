import 'firebase/auth';
import 'firebase/storage';

import app from 'firebase/app';

import { devConfig, prodConfig } from './firebase-config';

const config = process.env.NODE_ENV === 'production' ? prodConfig : devConfig;

class Firebase {
  auth: app.auth.Auth;
  storageRef: app.storage.Reference;


  constructor() {
    app.initializeApp(config);

    this.auth = app.auth();
    this.storageRef = app.storage().ref();
  }

  doSignIn = () => {
    return this.auth.signInAnonymously();
  };

  doSignOut = () => this.auth.signOut();

  doUploadImage = (imageFile: Blob | Uint8Array | ArrayBuffer, filename: string) => {
    const path = `images/${new Date().getTime()}_${filename}`;
    return this.storageRef.child(path).put(imageFile);
  }

  doDeleteImage = (imageUrl: string) => {
    return this.storageRef.storage.refFromURL(imageUrl).delete().catch(reason => {
      console.log(`Failed to delete image from storage:( url ${imageUrl}`, reason);
    });
  }
}

const firebaseApp = new Firebase();

export { firebaseApp }
