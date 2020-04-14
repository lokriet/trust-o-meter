import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { RequestHandler, Response, NextFunction } from 'express';
import helmet from 'helmet';
import http from 'http';
import logger from 'morgan';

import * as connectionUtils from './util/connectionUtils';
import * as httpErrors from './util/httpErrors';
import * as responseCodes from './util/responseCodes';

import initDatabase from './util/database';
initDatabase();

// const indexRouter = require('./routes/index');
const app = express();

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // tslint:disable-next-line: no-console
  console.log("I'm in production!");
  app.use(compression());
  app.use(helmet());
}
if (isDev) {
  // tslint:disable-next-line: no-console
  console.log('Running dev server');
  app.use(logger('dev'));
}

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

// app.use('/', indexRouter);


app.use((req: any, res: Response, next: NextFunction) => {
  throw httpErrors.pageNotFoundError();
});

// error handler
app.use((err: any, req: any, res: Response, next: NextFunction) => {
  // tslint:disable-next-line: no-console
  console.log(err);

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    statusCode,
    responseCode: err.responseCode || responseCodes.INTERNAL_SERVER_ERROR,
    message: err.message,
    data: err.data
  });
});

const port = connectionUtils.normalizePort(process.env.PORT || '3001');
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
server.on('error', connectionUtils.onError(port));
server.on('listening', connectionUtils.onListening(server));
