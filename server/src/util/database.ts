import mongoose from 'mongoose';

import logger from './logger';

const initDatabase = () => {
  // Removes the warning with promises
  mongoose.Promise = global.Promise;

  try {
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    mongoose.set('useCreateIndex', true);
  } catch (err) {
    mongoose.createConnection(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false
    });
    mongoose.set('useCreateIndex', true);
  }
  mongoose.connection
    .once('open', () => logger.info('MongoDB Running'))
    .on('error', (e) => {
      throw e;
    });

  if (process.env.NODE_ENV === 'development') {
    mongoose.set(
      'debug',
      (collectionName: string, method: string, query: any, doc: any) => {
        logger.debug(
          `${collectionName}.${method}\n${JSON.stringify(
            query,
            null,
            2
          )}`
        );
        logger.debug(JSON.stringify(
          doc,
          null,
          2
        ));
      }
    );
  }
};

export default initDatabase;
