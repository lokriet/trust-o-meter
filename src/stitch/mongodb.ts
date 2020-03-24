import { RemoteMongoClient, RemoteMongoCollection } from 'mongodb-stitch-browser-sdk';

import { app } from './app';

const mongoClient: RemoteMongoClient = app.getServiceClient(
  RemoteMongoClient.factory,
  "mongodb-atlas"
);

const profiles: RemoteMongoCollection<any> = mongoClient.db("trust-o-meter-dev").collection("profiles");

export { profiles };