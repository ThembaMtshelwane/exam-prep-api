import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../user/user.model";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

import jwt from "jsonwebtoken";
import { TokenPayload } from "./auth.types";
import { HTTP_CODES } from "../../consts/http.const";
import HttpError from "../../utils/http.error";
import { ENV_VARS } from "../../consts/env.const";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true, // Prevents JS from reading the cookie (XSS protection)
  secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  sameSite: "strict" as const, // Prevents CSRF
  maxAge: 15 * 60 * 60 * 1000, //15 min
};
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // Prevents JS from reading the cookie (XSS protection)
  secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  sameSite: "strict" as const, // Prevents CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    // 2. Hash Password (never store plain text)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create User
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
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
};

export const refresh = async (req: Request, res: Response) => {
  // ═══════════════════════════════════════
  // STEP 1: Extract Refresh Token from Cookie
  // ═══════════════════════════════════════
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Session expired" });

  try {
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
    const payload = decoded.payload as TokenPayload;

    // ═══════════════════════════════════════
    // STEP 3: Validate Payload BEFORE DB Query
    // ═══════════════════════════════════════
    // This prevents database queries with malicious data
    if (!payload.id)
      throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token structure");

    if (typeof payload.tokenVersion !== "number")
      throw new HttpError(HTTP_CODES.UNAUTHORIZED, "Invalid token structure");

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
    } catch (error) {
      
    }

    // Token Rotation: Remove used token, issue a new pair
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await user.save();

    res.cookie("refreshToken", newRefreshToken, REFRESH_COOKIE_OPTIONS);
    res.cookie("accessToken", newAccessToken, ACCESS_COOKIE_OPTIONS);
  } catch (err) {
    res.status(403).json({ message: "Invalid session" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.sendStatus(204);
};
