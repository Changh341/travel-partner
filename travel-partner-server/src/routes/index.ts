import express, { Express, Request, Response } from "express";
import apiRouter from "./api";

const router = express.Router();

router.use("/api", apiRouter);

export default router;
