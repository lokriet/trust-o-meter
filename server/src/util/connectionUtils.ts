import debugServer from 'debug';
import http from 'http';

import logger from './logger';

const debug = debugServer('server:server');

export const normalizePort = (val: string) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

export const onError = (port: any) => {
  return (error: any) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        logger.error(bind + ' requires elevated privileges');
        process.exit(1);
      case 'EADDRINUSE':
        logger.error(bind + ' is already in use');
        process.exit(1);
      default:
        throw error;
    }
  };
};

export const onListening = (server: http.Server) => {
  return () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
  };
};
