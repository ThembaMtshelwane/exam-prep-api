import { Request, Response, NextFunction } from "express";
import HttpError from "../utils/http.error";
import { HTTP_CODES } from "../consts/http.const";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../modules/auth/auth.types";
import User from "../modules/user/user.model";
import { ENV_VARS } from "../consts/env.const";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return next(
      new HttpError(HTTP_CODES.UNAUTHORIZED, "Access token required")
    );
  }

  try {
    const decoded = jwt.decode(accessToken, { complete: true });

    if (!decoded || !decoded.payload || typeof decoded.payload === "string") {
      return next(
        new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token structure")
      );
    }

    const payload = decoded.payload as TokenPayload;

    if (!payload.id || typeof payload.id !== "string") {
      return next(
        new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token structure")
      );
    }

    const user = await User.findById(payload.id).select(
      "+jwt_secret +tokenVersion -password"
    );

    if (!user || !user.access_token_secret) {
      return next(
        new HttpError(HTTP_CODES.NOT_FOUND, "Not authorized, user not found")
      );
    }

    const combinedSecret =
      user.access_token_secret + ENV_VARS.GLOBAL_ACCESS_SECRET;

    let verified: TokenPayload;
    try {
      verified = jwt.verify(accessToken, combinedSecret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new HttpError(HTTP_CODES.UNAUTHORIZED, "Token expired"));
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return next(new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token"));
      }
      throw error;
    }

    if (verified.id !== payload.id) {
      return next(new HttpError(HTTP_CODES.UNAUTHORIZED, "Token mismatch"));
    }

    req.user = user.omitField("jwt_secret");
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};

// Authorization: Checks if the user has the specific role required
export const authorize = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
