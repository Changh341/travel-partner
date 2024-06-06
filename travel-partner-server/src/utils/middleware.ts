import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.status === 404) {
    res.status(404).send({ errors: [{ message: "Resource not found" }] });
  } else {
    console.error(err.name, err.message, err.stack);
    res.status(500).send({ errors: [{ message: "Something went wrong" }] });
  }
};
