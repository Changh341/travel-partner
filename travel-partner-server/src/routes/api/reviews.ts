import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/:reviewId", async (req: Request, res: Response, next) => {
  const { reviewId } = req.params;
  const reviews = await prisma.review.findMany({
    where: {
      id: reviewId,
    },
  });
  if (reviews.length) return res.send(reviews);
  next();
});

router.post("/:attrId", async (req: Request, res: Response, next) => {
  const { attrId } = req.params;
  const { body, star, userId } = req.body;
  const review = await prisma.review.create({
    data: {
      attrId,
      body,
      star,
      userId,
      approved: "PENDING",
    },
  });
  if (review) return res.send(review);
  next();
});

router.patch("/:reviewId", async (req: Request, res: Response, next) => {
  const { reviewId } = req.params;
  const { body, star, userId } = req.body;
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      body,
      star,
      approved: "PENDING",
    },
  });
  if (review) return res.send(review);
  next();
});
