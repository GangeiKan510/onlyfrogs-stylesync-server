import { Request, Response, Router } from 'express';
import { createUser, getUsers } from '../../controllers/user';
import { UserSchema } from '../../validators/schemas/schemas';
import { validate } from '../../validators/validate';

const router = Router();

router.get('/get-users', async (req: Request, res: Response, next) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (error) {
    console.log(error);
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
