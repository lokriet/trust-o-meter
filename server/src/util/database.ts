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

  // if (process.env.NODE_ENV === 'development') {
  //   mongoose.set(
  //     'debug',
  //     (collectionName: string, method: string, query: any, doc: any, options: any) => {
  //       logger.debug(
  //         `${collectionName}.${method}\n${JSON.stringify(
  //           query,
  //           null,
  //           2
  //         )}`
  //       );
  //     }
  //   );
  // }
};

export default initDatabase;
