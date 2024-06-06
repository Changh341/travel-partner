import express, { Express, Request, Response } from "express";
import { lucia } from "./auth.js";
import { verifyRequestOrigin } from "lucia";

import type { Session, User } from "lucia";

const app: Express = express();

export const errorHandler = (err: Error, req: Request, res: Response) => {
  if (err.status === 404) {
    res.status(404).send({ errors: [{ message: "Resource not found" }] });
  } else {
    console.error(err.name, err.message, err.stack);
    res.status(500).send({ errors: [{ message: "Something went wrong" }] });
  }
};

export const csrfProtection = app.use((req, res, next) => {
  if (req.method === "GET") {
    return next();
  }
  const originHeader = req.headers.origin ?? null;
  const hostHeader = req.headers.host ?? null;
  if (
    !originHeader ||
    !hostHeader ||
    !verifyRequestOrigin(originHeader, [hostHeader])
  ) {
    return res.status(403).end();
  }
});

export const userValidation = app.use(async (req, res, next) => {
  const sessionId = lucia.readSessionCookie(req.headers.cookie ?? "");
  if (!sessionId) {
    res.locals.user = null;
    res.locals.session = null;
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createSessionCookie(session.id).serialize()
    );
  }
  if (!session) {
    res.appendHeader(
      "Set-Cookie",
      lucia.createBlankSessionCookie().serialize()
    );
  }
  res.locals.user = user;
  res.locals.session = session;
  return next();
});

declare global {
  namespace Express {
    interface Locals {
      user: User | null;
      session: Session | null;
    }
  }
}
