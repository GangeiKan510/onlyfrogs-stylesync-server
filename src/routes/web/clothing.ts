import { Request, Response, Router } from 'express';
import { validate } from '../../validators/validate';
import { CreateClothingRequestBodySchema } from '../../validators/schemas/schemas';

const router = Router();

router.get('/get-clothes', (req, res) => {
  res.send("You're trying to get clothes!");
});

router.get('/', (req: Request, res: Response) => {
  res.send('Web file router');
});

export default router;
