import { Request, Response, Router } from 'express';
import { getUsers } from '../../controllers/user';

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

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
