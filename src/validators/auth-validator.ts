import { NextFunction, Request, Response } from 'express';
import { createError401 } from '../utils/error-utils';
import { firebaseAdminApp } from '../controllers/firebase-core-controller';

const excludedPaths = ['/users/create-user'];

export const assertJwtExist =
  () => async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      if (excludedPaths.includes(req.path) || req.query.skipAuth === 'true') {
        console.log('Skipped JWT validation for path:', req.path);
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError401('Authorization token missing or incorrect.');
      }

      const token = authHeader.split(' ')[1];
      req.jwt = await firebaseAdminApp.auth().verifyIdToken(token);

      next();
    } catch (err: any) {
      console.error('JWT validation failed:', err.message);
      next(createError401('Invalid or expired token.'));
    }
  };

export const validateTokenOwnership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (excludedPaths.includes(req.path) || req.query.skipAuth === 'true') {
        return next();
      }

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError401('Authorization token missing or incorrect.');
      }

      const token = authHeader.split(' ')[1];

      const decodedToken = await firebaseAdminApp.auth().verifyIdToken(token);

      next();
    } catch (err: any) {
      console.error('Token validation failed:', err.message);
      next(createError401('Unauthorized access.'));
    }
  };
};
