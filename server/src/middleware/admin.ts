import * as httpErrors from '../util/httpErrors';
import User from '../model/User';

const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.isAdmin) {
      return next(httpErrors.notAuthorizedError());
    }
    next();
  } catch (error) {
    next(httpErrors.notAuthorizedError());
  }

}

export default isAdmin;