import { NextFunction, Request, Response } from "express";

export const errorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(500).send({ errors: [{ message: "Something went wrong" }] });
};
