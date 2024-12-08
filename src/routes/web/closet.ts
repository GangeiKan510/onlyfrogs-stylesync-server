import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import {
  ClosetSchema,
  DeleteClosetSchema,
  GetClosetesByIdRequestBodySchema,
} from '../../validators/schemas/schemas';
import {
  createCloset,
  deleteCloset,
  getAllClosetsByUser,
} from '../../controllers/closet';

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

router.post(
  '/delete-closet',
  validate(DeleteClosetSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { closetId } = req.body;

      if (!closetId) {
        return res.status(400).json({ error: 'Closet ID is required' });
      }

      const deletedCloset = await deleteCloset(closetId);

      res.status(200).json({
        message:
          'Closet and its associated clothing items deleted successfully',
        data: deletedCloset,
      });
    } catch (error) {
      console.error('Error deleting closet:', error);
      next(error);
    }
  }
);

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
