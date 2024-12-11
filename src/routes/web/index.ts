import dotenv from 'dotenv';
import express, { Request, Response, Router } from 'express';
import clothesRouter from './clothing';
import userRouter from './user';
import closetRouter from './closet';
import uploadRouter from './upload';
import chatRouter from './chat';
import scrapingRouter from './scraping';
import notificationRouter from './notification';
import fitsRouter from './fits';

dotenv.config();

const app: Router = express.Router();

app.use('/users', userRouter);
app.use('/clothes', clothesRouter);
app.use('/closet', closetRouter);
app.use('/chat', chatRouter);
app.use('/scraping', scrapingRouter);
app.use('/images', uploadRouter);
app.use('/notification', notificationRouter);
app.use('/fits', fitsRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Web router');
});

export default app;
