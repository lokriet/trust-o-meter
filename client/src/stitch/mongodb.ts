import { RemoteMongoClient, RemoteMongoCollection } from 'mongodb-stitch-browser-sdk';

import { app } from './app';

const mongoClient: RemoteMongoClient = app.getServiceClient(
  RemoteMongoClient.factory,
  "mongodb-atlas"
);

const profiles: RemoteMongoCollection<any> = mongoClient.db("trust-o-meter").collection("profiles");
const contacts: RemoteMongoCollection<any> = mongoClient.db("trust-o-meter").collection("contacts");

export { profiles, contacts };