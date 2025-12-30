import jwt from "jsonwebtoken";
import { IUser } from "../modules/user/user.types";
import { ENV_VARS } from "../consts/env.const";
import { TokenPayload } from "../modules/auth/auth.types";
import HttpError from "./http.error";
import { HTTP_CODES } from "../consts/http.const";
import User from "../modules/user/user.model";

export const generateAccessToken = (user: IUser): string => {
  const secret = (user.access_token_secret +
    ENV_VARS.GLOBAL_ACCESS_SECRET) as string;
  const payload: TokenPayload = {
    id: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
  return jwt.sign(payload, secret, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (user: IUser): string => {
  const secret = (user.refresh_token_secret +
    ENV_VARS.GLOBAL_REFRESH_SECRET) as string;
  const payload: TokenPayload = {
    id: user._id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
};

export const getUserIdFromTokenPayload = (token: string) => {
  // ═══════════════════════════════════════
  // STEP 2: Decode Token (No Verification Yet)
  // ═══════════════════════════════════════
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || !decoded.payload || typeof decoded.payload === "string") {
    throw new HttpError(
      HTTP_CODES.UNAUTHORIZED,
      "Invalid refresh token structure"
    );
  }
  // ═══════════════════════════════════════
  // STEP 3: Validate Payload BEFORE DB Query
  // ═══════════════════════════════════════
  // This prevents database queries with malicious data
  const payload = decoded.payload as TokenPayload;
  if (!payload.id || typeof payload.id !== "string") {
    throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token structure");
  }

  if (!payload.tokenVersion || typeof payload.tokenVersion !== "number") {
    throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token structure");
  }

  return payload.id;
};

export const verifyToken = (token:string,userSecret: string) => {
  const combinedSecret =
    userSecret + ENV_VARS.GLOBAL_REFRESH_SECRET;
  let verified: TokenPayload;
  try {
    verified = jwt.verify(token, combinedSecret) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token");
    }
    throw error;
  }

  return verified
};
