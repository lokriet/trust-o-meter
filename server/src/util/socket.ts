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
import jwt from 'jsonwebtoken';
import socketIo from 'socket.io';

import { AuthTokenPayload } from '../controllers/auth';
import logger from './logger';


let io: socketIo.Server = null;

export enum SocketEvents {
  StatusUpdated = 'statusUpdated',
  StatusDeleted = 'statusDeleted',

  ContactUpdate = 'contactUpdate',
  ContactDelete = 'contactDelete'
}

export enum ContactEventTypes {
  ContactRequest = 'contactRequest',
  ContactRequestApproved = 'contactRequestApproved',
  ContactRequestRejected = 'contactRequestRejected',
  ContactRequestWithdrawn = 'contactRequestWithdrawn',
  ContactDeleted = 'contactDeleted',
  ContactNameUpdated = 'contactNameUpdated',
  ContactTrustUpdated = 'contactTrustUpdated',
  ContactDoneActionsUpdated = 'contactDoneActionsUpdated'
}

const authenticateSocket = (namespace: string) => {
  return (socket: any, next: any) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      try {
        const decodedToken: AuthTokenPayload = jwt.verify(
          socket.handshake.query.token,
          process.env.AUTH_TOKEN_SECRET
        ) as AuthTokenPayload;
        if (namespace !== null && decodedToken.profileId !== namespace) {
          next(new Error('Authentication error'));
        } else {
          next();
        }
      } catch (err) {
        next(new Error('Authentication error'));
      }
    } else {
      next(new Error('Authentication error'));
    }
  };
};

export const initUserSocketNamespace = (profileId: string) => {
  if (!Object.keys(getIo().nsps).includes(profileId)) {
    getIo().of(profileId).use(authenticateSocket(profileId)).on('connection', (socket => {
      logger.info(`New socket connection on ${profileId}`);
      // logger.debug(socket);

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected on ${profileId}`);
      } );
    }));
    logger.info(`Initialized new socket namespace ${profileId}`);
    logger.debug(`${Object.keys(getIo().nsps).length} namespaces detected`);
    if (Object.keys(getIo().nsps).length < 50) {
      logger.debug(Object.keys(getIo().nsps));
    }
  }
}

export const messageUser = (profileId: string, eventName: string, ...args: any) => {
  logger.debug(`want to socket message user ${profileId}`);
  logger.debug(`${Object.keys(getIo().nsps).length} namespaces detected`);
  if (Object.keys(getIo().nsps).length < 50) {
    logger.debug(Object.keys(getIo().nsps));
  }
  if (Object.keys(getIo().nsps).includes(`/${profileId}`)) {
    getIo().of(profileId).emit(eventName, ...args);
    logger.debug('Message successful?');
  }
}

export const messageAll = (eventName: string, ...args: any) => {
  logger.debug(`want to socket message all`);
  getIo().emit(eventName, ...args);
  logger.debug('Message successful?');
}

export const initSocketIo = (server: any) => {
  io = socketIo(server);
  io.origins('*:*');
  io.use(authenticateSocket(null));

  io.on('connection', (socket => {
    logger.info(`New socket connection on common namespace`);
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected on common namespace`);
    } );
  }));

  logger.info('Socket.IO initialized');
};

const getIo = (): socketIo.Server => {
  if (io == null) {
    throw Error('Socket.IO is not initialized');
  } else {
    return io;
  }
};
