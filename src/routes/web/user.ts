import { Request, Response, Router } from 'express';
import {
  createUser,
  getUserByEmail,
  updateUser,
  updateName,
} from '../../controllers/user';
import {
  CreateUserSchema,
  UpdateUserNameSchema,
  UpdateUserSchema,
} from '../../validators/schemas/schemas';
import { validate } from '../../validators/validate';

const router = Router();

router.post('/get-me', async (req: Request, res: Response, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await getUserByEmail(email);

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    next(error);
  }
});

router.post(
  '/create-user',
  validate(CreateUserSchema),
  async (req: Request, res: Response, next) => {
    try {
      const userData = req.body;

      const newUser = await createUser(userData);

      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      next(error);
    }
  }
);

router.post(
  '/update-user',
  validate(UpdateUserSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { id, ...updates } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const updatedUser = await updateUser(id, updates);

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      next(error);
    }
  }
);

router.post(
  '/update-name',
  validate(UpdateUserNameSchema),
  async (req: Request, res: Response, next) => {
    try {
      const { id, first_name, last_name } = req.body;

      if (!id || !first_name || !last_name) {
        return res
          .status(400)
          .json({ error: 'User ID, first name, and last name are required' });
      }

      const updatedUser = await updateName(id, first_name, last_name);

      if (updatedUser.status === 200) {
        res.status(200).json(updatedUser);
      } else {
        res.status(updatedUser.status).json({ message: updatedUser.message });
      }
    } catch (error) {
      console.error('Error updating user name:', error);
      next(error);
    }
  }
);

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
