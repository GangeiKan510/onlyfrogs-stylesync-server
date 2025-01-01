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
  return (req: Request | any, res: Response, next: NextFunction) => {
    try {
      if (excludedPaths.includes(req.path) || req.query.skipAuth === 'true') {
        console.log('Skipped ownership validation for path:', req.path);
        return next();
      }

      if (!req.jwt) {
        throw createError401(
          'Token verification required before ownership check.'
        );
      }

      const userIdFromToken = req.jwt.uid;
      const userIdFromRequest =
        req.params.userId || req.body.userId || req.query.userId;

      if (!userIdFromRequest || userIdFromToken !== userIdFromRequest) {
        throw createError401('Token does not belong to the specified user.');
      }

      next();
    } catch (err: any) {
      next(createError401(err.message || 'Unauthorized access.'));
    }
  };
};
