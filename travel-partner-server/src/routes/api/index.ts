import express, { Express, Request, Response } from "express";
import usersRouter from "./users";
const router = express.Router();
const app: Express = express();

router.use("/users", usersRouter);

export default router;
