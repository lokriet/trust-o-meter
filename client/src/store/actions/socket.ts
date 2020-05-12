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
import { Contact } from '../model/contact';
import {
  ContactEventTypes,
  SocketContactUpdate,
  SocketEvents
} from '../model/socketUpdate';
import { Status } from '../model/status';
import { State } from '../reducers/state';
import { generateIdentificator } from '../../util/utility';

export const SocketActionTypes = {
  SET_SOCKETS: 'SET_SOCKETS',
  ADD_UPDATE: 'ADD_UPDATE',
  PICK_UPDATE_FOR_SHOWING: 'PICK_UPDATE_FOR_SHOWING'
};

export const initSocketConnection = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const profile = getState().profile.profile;
      const token = getState().auth.token;

      if (!profile) {
        //TODO
      } else {
        const commonSocket = socketIo.connect(env.serverUrl, {
          query: { token }
        });
        console.log('Connected to common socket io', commonSocket);
        commonSocket.on(SocketEvents.StatusUpdated, (updatedStatus: Status) => {
          console.log('Received status update socket message', updatedStatus);
          dispatch(actions.applyStatusUpdate(updatedStatus));
        });
        commonSocket.on(
          SocketEvents.StatusDeleted,
          (updatedStatusId: string) => {
            console.log(
              'Received status delete socket message',
              updatedStatusId
            );
            dispatch(actions.applyStatusDelete(updatedStatusId));
          }
        );

        const userSocket = socketIo.connect(`${env.serverUrl}/${profile._id}`, {
          query: { token }
        });
        console.log('Connected to user socket io', userSocket);
        userSocket.on(
          SocketEvents.ContactUpdate,
          (
            updatedContact: Contact,
            contactSocketEventType: ContactEventTypes
          ) => {
            console.log(
              'Received contact update socket message',
              updatedContact
            );
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
            console.log(
              'Received contact delete socket message',
              deletedContact._id
            );
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
        console.log('User Socket disconnected successfully');
        dispatch(setSockets(null, null));
      } else {
        console.log('No user socket to disconnect');
      }
    } catch (error) {
      console.log('Failed to disconnect user socket');
    }

    try {
      const commonSocket = getState().socket.commonSocket;
      if (commonSocket) {
        commonSocket.close();
        console.log('Common Socket disconnected successfully');
        dispatch(setSockets(null, null));
      } else {
        console.log('No common socket to disconnect');
      }
    } catch (error) {
      console.log('Failed to disconnect common socket');
    }
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
