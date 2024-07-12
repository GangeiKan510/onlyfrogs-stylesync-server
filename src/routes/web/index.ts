import dotenv from "dotenv";
import express, { Request, Response, Router } from "express";
import clothesRouter from "./clothes";

dotenv.config();

const app: Router = express.Router();

app.use("/clothes", clothesRouter);

app.get("/", (req: Request, res: Response) => {
    res.send("Web router");
});

export default app;
