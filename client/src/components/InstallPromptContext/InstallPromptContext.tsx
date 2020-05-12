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
import React, { createContext, useCallback, useEffect, useState } from 'react';


export interface InstallPromptContextValue {
  installPrompt: any;
  showInstallButton: boolean;
  setShowInstallButton: any;
}

export const InstallPromptContext = createContext<InstallPromptContextValue>({installPrompt: null, showInstallButton: false, setShowInstallButton: () => {}});

export const InstallPromptContextProvider = (props) => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  const listener = useCallback((event) => {
    event.preventDefault();
    // console.log('Install Prompt fired');
    setInstallPrompt(event);

    // See if the app is already installed, in that case, do nothing
    if (
      (window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches) 
        || window.navigator['standalone'] === true
    ) {
      return false;
    }

    setShowInstallButton(true);
  }, []);

  useEffect(() => {
    // console.log('Adding install prompt listener');

    window.addEventListener('beforeinstallprompt', listener);
    return () => {
      // console.log('Removing install prompt listener');
      window.removeEventListener('beforeinstallprompt', listener);
    };
  }, [listener]);
  // console.log('context', showInstallButton);
  return (
    <InstallPromptContext.Provider value={{installPrompt, showInstallButton, setShowInstallButton}}>
      {props.children}
    </InstallPromptContext.Provider>
  );
};

