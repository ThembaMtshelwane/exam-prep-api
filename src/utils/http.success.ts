import { Response } from "express";

interface ApiResponse<T> {
  message: string;
  data?: T | T[];
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T | T[]
) => {
  const response: ApiResponse<T> = { message, data };
  return res.status(statusCode).json(response);
};
