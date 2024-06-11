import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/:attrId", async (req: Request, res: Response, next) => {
  const { attrId } = req.params;
  const reviews = await prisma.review.findMany({
    where: {
      attrId,
    },
  });
  if (reviews.length) return res.send(reviews);
  next();
});
