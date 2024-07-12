import { Request, Response, Router } from 'express';

const router = Router();

router.get('/get-clothes', (req, res) => {
  res.send("You're trying to get clothes!");
});

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
