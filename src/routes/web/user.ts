import { Request, Response, Router } from 'express';
import { createUser, getUserByEmail } from '../../controllers/user';
import { UserSchema } from '../../validators/schemas/schemas';
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
  validate(UserSchema),
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

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
