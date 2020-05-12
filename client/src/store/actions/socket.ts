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
import { State } from '../reducers/state';

export const SocketActionTypes = {
  SET_SOCKET: 'SET_SOCKET'
}

enum SocketEvents{
  ContactUpdate = 'contactUpdate',
  ContactDelete = 'contactDelete'
}

export const initSocketConnection = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const profile = getState().profile.profile;
      const token = getState().auth.token;

      if (!profile) {
        //TODO
      } else {
        const socket = socketIo.connect(`${env.serverUrl}/${profile._id}`, {
          query: {token: token}
        });
        console.log('Connected to socket io', socket);
        dispatch(setSocket(socket));
        socket.on(SocketEvents.ContactUpdate, (updatedContact: Contact)  => {
          console.log('Received contact update socket message', updatedContact);
          dispatch(actions.applyContactUpdate(updatedContact));
        });
        socket.on(SocketEvents.ContactDelete, (contactId: string)  => {
          console.log('Received contact delete socket message', contactId);
          dispatch(actions.applyContactDelete(contactId));
        });
      }

    } catch (error) {
      console.log('Failed to connect to socket io');
    }
  }
}

export const disconnectSocket = () => {
  return async (dispatch: (...args: any[]) => void, getState: () => State) => {
    try {
      const socket = getState().socket.socket;
      if (socket) {
        socket.close();
        console.log('Socket disconnected successfully');
        dispatch(setSocket(null));
      } else {
        console.log('No socket to disconnect');
      }
    } catch (error) {
      console.log('Failed to disconnect socket');
    }
  }
}

const setSocket = (socket) => {
  return {
    type: SocketActionTypes.SET_SOCKET,
    socket
  }
}