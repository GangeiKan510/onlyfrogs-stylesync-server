import dotenv from "dotenv";
import express, { NextFunction, Request, Response, Router } from "express";

dotenv.config();

const app: Router = express.Router();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Main routes");
});

export default app;
