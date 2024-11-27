import { NextFunction, Request, Response } from 'express';

import { createError401 } from '../utils/error-utils';
import { firebaseAdminApp } from '../controllers/firebase-core-controller';

export const assertJwtExist =
  () => async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw createError401('Authorization token missing or incorrect.');
      }
      const token = authHeader.split(' ')[1];
      req.jwt = await firebaseAdminApp.auth().verifyIdToken(token);
      next();
    } catch (err) {
      next(createError401('Invalid or expired token.'));
    }
  };
