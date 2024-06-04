import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateIdFromEntropySize } from "lucia";
import { hash, verify } from "@node-rs/argon2";
import { lucia } from "../../utils/auth";
import { isValidEmail } from "../../utils/validation";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/:userId", async (req: Request, res: Response, next) => {
  const { userId } = req.params;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  user ? res.send(user) : next();
});

router.post("/signup", async (req: Request, res: Response, next) => {
  const formData = await req.body;
  const email = formData.email;
  const username = formData.username;
  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return res.status(400).send("Invalid email");
  }

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (user) {
    return res.status(400).send("Invalid username taken");
  }

  const password = formData.password;
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).send("Invalid password");
  }
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const userId = generateIdFromEntropySize(10);
  try {
    await prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        password: passwordHash,
      },
    });
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return res
      .status(302)
      .set({ Location: "/", "Set-Cookie": sessionCookie.serialize() })
      .send("Success");
  } catch {
    return res.status(400).send("Email already taken");
  }
});

router.post("/login", async (req: Request, res: Response, next) => {
  const formData = await req.body;
  const email = formData.email;
  if (!email || typeof email !== "string") {
    return res.status(400).send("Invalid email");
  }
  const password = formData.password;
  if (!password || typeof password !== "string") {
    return res.status(400).send("Empty password");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(400).send("Invalid email or password");
  }
  const validPassword = await verify(user.password, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  if (!validPassword) {
    return res.status(400).send("Invalid email or password");
  }
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  return res
    .status(302)
    .set({ Location: "/", "Set-Cookie": sessionCookie.serialize() })
    .send("Success");
});
export default router;
