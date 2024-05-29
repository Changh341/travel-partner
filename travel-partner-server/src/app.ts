import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import routes from "./routes";

dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT || 3000;

app.use("/", routes);

app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  next(err);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
