import { Request, Response, NextFunction } from "express";
import HttpError from "../utils/http.error";
import { ERROR_MESSAGES, HTTP_CODES } from "../consts/http.const";
import { ZodError } from "zod";
import { ENV_VARS } from "../consts/env.const";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError(
    HTTP_CODES.NOT_FOUND,
    `Not Found - ${req.originalUrl}`
  );
  next(error);
};

const handleZodError = (err: ZodError) => {
  const errors = err.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  return {
    statusCode: HTTP_CODES.BAD_REQUEST,
    body: {
      errors,
      message: "Validation Error",
    },
  };
};

export const errorHandler = (
  err: unknown | ZodError | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): unknown => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({
      message: err.message,
      stack: ENV_VARS.NODE_ENV === "production" ? undefined : err.stack,
    });
  }

  if (err instanceof ZodError) {
    const { statusCode, body } = handleZodError(err);
    return res.status(statusCode).json(body);
  }

  res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    stack:
      ENV_VARS.NODE_ENV === "production"
        ? null
        : typeof err === "object" && err !== null && "stack" in err
        ? (err as Error).stack
        : undefined,
  });
};
