import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";
const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req: Request, res: Response, next) => {
  const attr = await prisma.attraction.findMany({
    where: {
      reviewStatus: "APPROVED",
    },
    select: {
      name: true,
      type: true,
      location: true,
      metatags: true,
    },
  });

  if (attr.length) return res.send(attr);
  next();
});

router.get("/:attrId", async (req: Request, res: Response, next) => {
  const { attrId } = req.params;
  const attr = await prisma.attraction.findUnique({
    where: {
      id: attrId,
      reviewStatus: "APPROVED",
    },
  });

  if (attr) return res.send(attr);
  next();
});

export default router;
