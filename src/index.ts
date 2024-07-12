import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import 'dotenv/config';
import webRouter from "./routes/web"

const port = process.env.PORT || 3000;
const app: Express = express();

app.use(express.json());
app.use(cors());

app.use("/web", webRouter);

app.get('/', (req: Request, res: Response) => res.send('OnlyFrogs StyleSync Server'));

app.listen(port, () => {
 console.log(`App listening on port: ${port}`);
});