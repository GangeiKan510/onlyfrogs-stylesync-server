import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import {
  ClosetSchema,
  GetClosetesByIdRequestBodySchema,
} from '../../validators/schemas/schemas';
import { createCloset, getAllClosetsByUser } from '../../controllers/closet';

const router = Router();

router.post(
  '/create-closet',
  validate(ClosetSchema),
  async (req: Request, res: Response, next) => {
    try {
      const closetData = req.body;

      const newCloset = await createCloset(closetData);

      res.status(201).json(newCloset);
    } catch (error) {
      console.error('Error creating user:', error);
      next(error);
    }
  }
);

router.post(
  '/my-closets',
  validate(GetClosetesByIdRequestBodySchema),
  async (req, res, next) => {
    try {
      const { user_id } = req.body;

      const closets = await getAllClosetsByUser(user_id);

      res.json(closets);
    } catch (err) {
      console.error(err);
      next(err);
    }
  }
);

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
