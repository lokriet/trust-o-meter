import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import expressPino from 'express-pino-logger';
import helmet from 'helmet';
import http from 'http';
import morganLogger from 'morgan';

import authRouter from './routes/auth';
import contactsRouter from './routes/contacts';
import profileRouter from './routes/profile';
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
