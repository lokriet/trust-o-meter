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
import socketIo from 'socket.io-client';

import * as actions from '.';
import env from '../../secret/environment';
import { generateIdentificator } from '../../util/utility';
import { Contact } from '../model/contact';
import { ContactEventTypes, SocketContactUpdate, SocketEvents } from '../model/socketUpdate';
import { Status } from '../model/status';
import { State } from '../reducers/state';

export const SocketActionTypes = {
  SET_SOCKETS: 'SET_SOCKETS',
  ADD_UPDATE: 'ADD_UPDATE',
  PICK_UPDATE_FOR_SHOWING: 'PICK_UPDATE_FOR_SHOWING',
  SET_SOCKETS_ENABLED: 'SET_SOCKETS_ENABLED',
  RESET_SOCKET_STORE: 'RESET_SOCKET_STORE'
};

export const initSocketConnection = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const profile = getState().profile.profile;
      const token = getState().auth.token;
      const enabled = getState().socket.enabled;

      if (!profile || !enabled) {
        // console.log('skip connecting to sockets');
      } else {
        let commonSocket = getState().socket.commonSocket;
        if (commonSocket !== null) {
          // console.log('Common socket is already connected?');
        } else {
          commonSocket = socketIo.connect(env.serverUrl, {
            forceNew: true,
            query: { token }
          });
          // console.log('Connected to common socket io', commonSocket);
          commonSocket.on(SocketEvents.StatusUpdated, (updatedStatus: Status) => {
            // console.log('Received status update socket message', updatedStatus);
            dispatch(actions.applyStatusUpdate(updatedStatus));
          });
          commonSocket.on(
            SocketEvents.StatusDeleted,
            (updatedStatusId: string) => {
              // console.log(
              //   'Received status delete socket message',
              //   updatedStatusId
              // );
              dispatch(actions.applyStatusDelete(updatedStatusId));
            }
          );
        }

        let userSocket = getState().socket.userSocket;
        if (userSocket !== null) {
          // console.log('User socket is already connected?');
        } else {
          userSocket = socketIo.connect(`${env.serverUrl}/${profile._id}`, {
            forceNew: true,
            query: { token }
          });
          // console.log('Connected to user socket io', userSocket);
          userSocket.on(
            SocketEvents.ContactUpdate,
            (
              updatedContact: Contact,
              contactSocketEventType: ContactEventTypes
            ) => {
              // console.log(
              //   'Received contact update socket message',
              //   updatedContact
              // );
              dispatch(actions.applyContactUpdate(updatedContact));
              dispatch(
                addUpdate({
                  id: generateIdentificator(),
                  contact: updatedContact,
                  updateType: contactSocketEventType
                })
              );
            }
          );
          userSocket.on(
            SocketEvents.ContactDelete,
            (
              deletedContact: Contact,
              contactSocketEventType: ContactEventTypes
            ) => {
              // console.log(
              //   'Received contact delete socket message',
              //   deletedContact._id
              // );
              dispatch(actions.applyContactDelete(deletedContact._id));
              dispatch(
                addUpdate({
                  id: generateIdentificator(),
                  contact: deletedContact,
                  updateType: contactSocketEventType
                })
              );
            }
          );
        }

        dispatch(setSockets(commonSocket, userSocket));
      }
    } catch (error) {
      console.log('Failed to connect to socket io');
    }
  };
};

export const disconnectSocket = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const userSocket = getState().socket.userSocket;
      if (userSocket) {
        userSocket.close();
        // console.log('User Socket disconnec\ted successfully');
      } else {
        // console.log('No user socket to disconnect');
      }
    } catch (error) {
      // console.log('Failed to disconnect user socket');
    }

    try {
      const commonSocket = getState().socket.commonSocket;
      if (commonSocket) {
        commonSocket.close();
        // console.log('Common Socket disconnected successfully');
      } else {
        // console.log('No common socket to disconnect');
      }
    } catch (error) {
      // console.log('Failed to disconnect common socket');
    }

    dispatch(setSockets(null, null));
  };
};

export const changeSocketEnabledSettings = (enabled: boolean, onOperationDone: any) => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      // console.log('[socket action] changing socket checkbox in state');
      dispatch(setSocketsEnabled(enabled));

      const token = getState().auth.token;
      const result = await fetch(`${env.serverUrl}/socket/updateSocketEnabled`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({enabled})
      });

      if (result.status === 200) {
        onOperationDone(true);
      } else {
        onOperationDone(false);
      }
    } catch(error) {
      onOperationDone(false);
    } 
  }
}

export const resetSocketStore = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      dispatch(disconnectSocket());
    } catch(error) {
      console.log('Failed to disconnect sockets :(');
    } finally {
      dispatch(doResetSocketStore());
    }
  }
}

export const setSocketsEnabled = (enabled: boolean) => {
  return {
    type: SocketActionTypes.SET_SOCKETS_ENABLED,
    enabled
  };
};

const setSockets = (commonSocket, userSocket) => {
  return {
    type: SocketActionTypes.SET_SOCKETS,
    commonSocket,
    userSocket
  };
};

const addUpdate = (update: SocketContactUpdate) => {
  return {
    type: SocketActionTypes.ADD_UPDATE,
    update
  };
};

export const pickUpdateForShowing = (updateId: string) => {
  return {
    type: SocketActionTypes.PICK_UPDATE_FOR_SHOWING,
    updateId
  };
};

const doResetSocketStore = () => {
  return {
    type: SocketActionTypes.RESET_SOCKET_STORE
  }
}
