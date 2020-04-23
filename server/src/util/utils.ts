import jwt from 'jsonwebtoken';

import { AuthTokenPayload } from '../controllers/auth';


export const generateIdentificator = (): string => {
  const result = (Date.now() + Math.floor(Math.random() * 8000000000)).toString(36);
  return result;
};

export const createAuthToken = (payload: AuthTokenPayload) => {
  return jwt.sign(payload, process.env.AUTH_TOKEN_SECRET);
}