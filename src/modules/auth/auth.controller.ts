import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../user/user.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

const COOKIE_OPTIONS = {
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

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id, user.role);

  // Store refresh token in DB array for rotation
  user.refreshTokens.push(refreshToken);
  await user.save();

  // Set Cookie for Refresh Token, send Access Token in JSON
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
  res.json({ accessToken, role: user.role });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "Session expired" });

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded._id);

    // Security check: is this token still valid in our DB?
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // Token Rotation: Remove used token, issue a new pair
    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.role);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Invalid session" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const user = await User.findById(req.user?._id);
  if (user) {
    // Delete the token from DB so it can't be used again
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    await user.save();
  }
  res.sendStatus(204);
};
