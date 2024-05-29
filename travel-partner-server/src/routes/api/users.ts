import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
const app: Express = express();
const prisma = new PrismaClient();

app.get("/all", async (req: Request, res: Response) => {
  const allUsers = await prisma.user.findMany();
  res.send(allUsers);
});

export default app;
