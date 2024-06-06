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

router.post("/", async (req: Request, res: Response, next) => {
  if (!res.locals.user) {
    return res.status(403).end();
  }

  const { name, type, desc, location, metatags } = req.body;
  const attr = await prisma.attraction.create({
    data: { name, type, desc, location, metatags, reviewStatus: "PENDING" },
  });

  if (attr) return res.send(attr);
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

router.put("/attrId/approval", async (req: Request, res: Response, next) => {
  if (!res.locals.user || res.locals.user.role !== "ADMIN") {
    return res.status(403).end();
  }
  const { attrId } = req.params;
  const { name, type, desc, location, metatags } = req.body;

  const attr = await prisma.attraction.update({
    where: { id: attrId },
    data: {
      name,
      type,
      desc,
      location,
      metatags,
      reviewStatus: "APPROVED",
    },
  });

  if (attr) return res.send(attr);
  next();
});

export default router;
