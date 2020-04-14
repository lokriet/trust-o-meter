import mongoose from 'mongoose';

const initDatabase = () => {
  // Removes the warning with promises
  mongoose.Promise = global.Promise;

  try {
    mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    mongoose.set('useCreateIndex', true);
  } catch (err) {
    mongoose.createConnection(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
    mongoose.set('useCreateIndex', true);
  }
  mongoose.connection
    // tslint:disable-next-line: no-console
    .once('open', () => console.log('MongoDB Running'))
    .on('error', (e) => {
      throw e;
    });
};

export default initDatabase;