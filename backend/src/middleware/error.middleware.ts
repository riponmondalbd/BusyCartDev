import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let { statusCode, message } = err;

  if (!statusCode) {
    statusCode = 500;
  }

  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    response.message = "Internal Server Error";
  }

  res.status(statusCode).send(response);
};
