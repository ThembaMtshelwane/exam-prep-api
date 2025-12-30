import { Request, Response, NextFunction } from "express";
import HttpError from "../utils/http.error";
import { HTTP_CODES } from "../consts/http.const";
import jwt from "jsonwebtoken";
import { TokenPayload } from "../modules/auth/auth.types";
import User from "../modules/user/user.model";
import { ENV_VARS } from "../consts/env.const";
import asyncHandler from "express-async-handler";

export const authenticate = asyncHandler(
  async (req: Request, _: Response, next: NextFunction) => {
    // ═══════════════════════════════════════
    // STEP 1: Extract Refresh Token from Cookie
    // ═══════════════════════════════════════
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Access token required");
    }

    // ═══════════════════════════════════════
    // STEP 2: Decode Token (No Verification Yet)
    // ═══════════════════════════════════════
    const decoded = jwt.decode(accessToken, { complete: true });
    if (!decoded || !decoded.payload || typeof decoded.payload === "string") {
      throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token structure");
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

    // ═══════════════════════════════════════
    // STEP 4: Get User with Secrets from Database
    // ═══════════════════════════════════════
    const user = await User.findById(payload.id).select(
      "+jwt_secret +tokenVersion -password"
    );
    if (!user || !user.access_token_secret) {
      throw new HttpError(
        HTTP_CODES.NOT_FOUND,
        "Not authorized, user not found"
      );
    }

    // ═══════════════════════════════════════
    // STEP 5: Verify Access Token with Combined Secret
    // ═══════════════════════════════════════
    const combinedSecret =
      user.access_token_secret + ENV_VARS.GLOBAL_ACCESS_SECRET;
    let verified: TokenPayload;
    try {
      verified = jwt.verify(accessToken, combinedSecret) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token");
      }
      throw error;
    }

    if (verified.id !== payload.id) {
      throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Token mismatch");
    }
    req.user = user.omitField("jwt_secret");
    next();
  }
);

// Authorization: Checks if the user has the specific role required
export const authorize = (role: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (role.includes(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
