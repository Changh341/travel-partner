import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import routes from "./routes";
import { webcrypto } from "node:crypto";

dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();
globalThis.crypto = webcrypto as Crypto;
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/", routes);

app.use((_req, _res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  next(err);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
