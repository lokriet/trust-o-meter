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

export interface SocketState {
  commonSocket: any;
  userSocket: any;
}

const initialState: SocketState = {
  commonSocket: null,
  userSocket: null
};

export const socketReducer = (state: SocketState = initialState, action) => {
  switch (action.type) {
    case actionTypes.socket.SET_SOCKETS:
      return {
        socket: action.socket
      };
    default:
      return state;
  }
};
