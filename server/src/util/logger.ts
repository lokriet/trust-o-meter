import pino from 'pino';

export default pino({ level: process.env.LOG_LEVEL || 'info', prettyPrint: process.env.NODE_ENV === 'development' });