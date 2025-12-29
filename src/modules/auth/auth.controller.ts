import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../user/user.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import jwt from "jsonwebtoken";
import { TokenPayload } from "./auth.types";
import { HTTP_CODES } from "../../consts/http.const";
import HttpError from "../../utils/http.error";
import { ENV_VARS } from "../../consts/env.const";
import asyncHandler from "express-async-handler";
import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "../../utils/cookie";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 1. Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new HttpError(HTTP_CODES.BAD_REQUEST, "Email already in use");

  // 2. Hash Password (never store plain text)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Create User
  const user = await User.create({ email, password: hashedPassword });

  if (!user)
    throw new HttpError(
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      "Registration failed"
    );

  res
    .status(HTTP_CODES.CREATED)
    .json({ message: "User registered successfully" });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(HTTP_CODES.BAD_REQUEST, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set Cookie for Refresh Token and  Access Token in JSON
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);

  res.status(HTTP_CODES.OK).json({
    message: "Successfully logged in",
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // ═══════════════════════════════════════
  // STEP 1: Extract Refresh Token from Cookie
  // ═══════════════════════════════════════
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) res.status(401).json({ message: "Session expired" });

  // ═══════════════════════════════════════
  // STEP 2: Decode Token (No Verification Yet)
  // ═══════════════════════════════════════
  const decoded = jwt.decode(refreshToken, { complete: true });
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

  // ═══════════════════════════════════════
  // STEP 4: Get User with Secrets from Database
  // ═══════════════════════════════════════
  const user = await User.findById(payload.id);
  if (!user || !user.refresh_token_secret)
    throw new HttpError(HTTP_CODES.NOT_FOUND, "User not found");

  // ═══════════════════════════════════════
  // STEP 5: Verify Refresh Token with Combined Secret
  // ═══════════════════════════════════════
  const secret = user.refresh_token_secret + ENV_VARS.GLOBAL_REFRESH_SECRET;

  let verified: TokenPayload;
  try {
    verified = jwt.verify(refreshToken, secret) as TokenPayload;
  } catch (error) {}

  // Token Rotation: Remove used token, issue a new pair
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await user.save();

  res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);
  res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(204).json({ message: "User logged out successfully" });
});
