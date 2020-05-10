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
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import expressPino from 'express-pino-logger';
import helmet from 'helmet';
import http from 'http';
import morganLogger from 'morgan';

import authRouter from './routes/auth';
import contactsRouter from './routes/contacts';
import notificationsRouter from './routes/notifications';
import profileRouter from './routes/profile';
import statusRouter from './routes/status';
import * as connectionUtils from './util/connectionUtils';
import initDatabase from './util/database';
import * as httpErrors from './util/httpErrors';
import logger from './util/logger';
import * as responseCodes from './util/responseCodes';


initDatabase();

const app = express();

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  logger.info("I'm in production!");
  app.use(compression());
  app.use(helmet());
}
if (isDev) {
  logger.info('Running dev server');
  app.use(morganLogger('dev'));
}

const expressLogger = expressPino({ logger });
app.use(expressLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/auth', authRouter);
app.use('/profile', profileRouter);
app.use('/contacts', contactsRouter);
app.use('/status', statusRouter);
app.use('/notifications', notificationsRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  throw httpErrors.pageNotFoundError();
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.debug(err);

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    statusCode,
    responseCode: err.responseCode || responseCodes.INTERNAL_SERVER_ERROR,
    message: statusCode === 500 ? 'Internal server error' : err.message,
    data: err.data
  });
});

const port = connectionUtils.normalizePort(process.env.PORT || '3001');
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', connectionUtils.onError(port));
server.on('listening', connectionUtils.onListening(server));
