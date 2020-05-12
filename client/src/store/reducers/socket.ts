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
import * as actionTypes from '../actions/actionTypes';
import { SocketContactUpdate } from '../model/socketUpdate';

export interface SocketState {
  commonSocket: any;
  userSocket: any;
  updates: SocketContactUpdate[];
}

const initialState: SocketState = {
  commonSocket: null,
  userSocket: null,
  updates: []
};

export const socketReducer = (state: SocketState = initialState, action): SocketState => {
  switch (action.type) {
    case actionTypes.socket.SET_SOCKETS:
      return {
        ...state,
        commonSocket: action.commonSocket,
        userSocket: action.userSocket
      };
    case actionTypes.socket.ADD_UPDATE:
      return {
        ...state,
        updates: [action.update, ...state.updates]
      }
    case actionTypes.socket.PICK_UPDATE_FOR_SHOWING:
      return {
        ...state,
        updates: state.updates.filter(update => update.id !== action.updateId)
      }
    default:
      return state;
  }
};
