import dotenv from 'dotenv';
import express, { Request, Response, Router } from 'express';
import clothesRouter from './clothing';
import userRouter from './user';
import closetRouter from './closet';

dotenv.config();

const app: Router = express.Router();

app.use('/users', userRouter);
app.use('/clothes', clothesRouter);
app.use('/closet', closetRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Web router');
});

export default app;
