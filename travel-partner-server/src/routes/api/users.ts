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
    return new Response("Invalid email", {
      status: 400,
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
  });

  if (user) {
    return new Response("Username taken", {
      status: 400,
    });
  }

  const password = formData.password;
  if (!password || typeof password !== "string" || password.length < 6) {
    return new Response("Invalid password", {
      status: 400,
    });
  }
  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const userId = generateIdFromEntropySize(10);
  try {
    prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        password: passwordHash,
      },
    });
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
      },
    });
  } catch {
    return new Response("Email already used", {
      status: 400,
    });
  }
});

router.post("/login", async (req: Request, res: Response, next) => {
  const formData = await req.body;
  const email = formData.email;
  if (!email || typeof email !== "string") {
    return new Response("Invalid email", {
      status: 400,
    });
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
    return new Response("Invalid email or password", {
      status: 400,
    });
  }
  const validPassword = await verify(user.password, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  if (!validPassword) {
    return new Response("Invalid email or password", {
      status: 400,
    });
  }
  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": sessionCookie.serialize(),
    },
  });
});
export default router;
