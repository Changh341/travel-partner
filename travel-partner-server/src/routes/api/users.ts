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
    res.status(400);
    res.send("Invalid email");
  }

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (user) {
    res.status(400);
    res.send("Invalid username taken");
  }

  const password = formData.password;
  if (!password || typeof password !== "string" || password.length < 6) {
    res.status(400);
    res.send("Invalid password");
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
    res.status(302);
    res.set({ Location: "/", "Set-Cookie": sessionCookie.serialize() });
    res.send("Success");
  } catch {
    res.status(400);
    res.send("Email already taken");
  }
});

router.post("/login", async (req: Request, res: Response, next) => {
  const formData = await req.body;
  const email = formData.email;
  if (!email || typeof email !== "string") {
    res.status(400);
    res.send("Invalid email");
  }
  const password = formData.get("password");
  if (!password || typeof password !== "string") {
    return new Response(null, {
      status: 400,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    res.status(400);
    res.send("Invalid email or password");
    return;
  }
  const validPassword = await verify(user.password, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  if (!validPassword) {
    res.status(400);
    res.send("Invalid email or password");
  }
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  res.status(302);
  res.set({ Location: "/", "Set-Cookie": sessionCookie.serialize() });
  res.send("Success");
});
export default router;
