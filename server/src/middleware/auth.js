import jwt from 'jsonwebtoken';

import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError('Invalid token', 'INVALID_TOKEN', 401);
  }

  const user = await User.findById(payload.sub);

  if (!user) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 401);
  }

  req.user = user;
  next();
});
