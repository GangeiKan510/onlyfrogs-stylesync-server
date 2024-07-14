import { Request, Response, Router } from 'express';
import { createClothing } from '../../controllers/clothes';

const router = Router();

router.get('/get-clothes', (req, res) => {
  res.send("You're trying to get clothes!");
});

router.post('/create-clothing', createClothing);

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
