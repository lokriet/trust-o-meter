import jwt from 'jsonwebtoken';

import { AuthTokenPayload } from '../controllers/auth';
import * as httpErrors from '../util/httpErrors';

const isAuthenticated = async (req: any, res: any, next: any) => {
  const header = req.get('Authorization');
  if (!header) {
    throw httpErrors.notAuthenticatedError();
  }
  const token = header.split(' ')[1]; // value after 'Bearer '
  if (!token) {
    throw httpErrors.notAuthenticatedError();
  }
  try {
    const decodedToken: AuthTokenPayload = jwt.verify(token, process.env.AUTH_TOKEN_SECRET) as AuthTokenPayload;
    req.userId = decodedToken.userId;
    req.profileId = decodedToken.profileId;
  } catch (err) {
    next(httpErrors.notAuthenticatedError());
  }

  next();
}

export default isAuthenticated;