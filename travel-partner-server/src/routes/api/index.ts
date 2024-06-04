import express, { Express, Request, Response } from "express";
import usersRouter from "./users";
import attractionsRouter from "./attractions";
const router = express.Router();

router.use("/users", usersRouter);
router.use("/attractions", attractionsRouter);

export default router;
