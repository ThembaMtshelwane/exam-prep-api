import jwt from "jsonwebtoken";
import { UserRole } from "../modules/user/user.model";
import mongoose, {Schema } from "mongoose";

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

export interface TokenPayload {
  _id: mongoose.Types.ObjectId;
  role: UserRole;
}

// 1. Access Token: Fast expiry, sent in Authorization header
export const generateAccessToken = (
  _id: mongoose.Types.ObjectId,
  role: UserRole
): string => {
  return jwt.sign({ _id, role }, ACCESS_SECRET, { expiresIn: "15m" });
};

// 2. Refresh Token: Long expiry, used to 'refresh' the session
export const generateRefreshToken = (
  _id: mongoose.Types.ObjectId,
  role: UserRole
): string => {
  return jwt.sign({ _id, role }, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, ACCESS_SECRET) as TokenPayload;
export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, REFRESH_SECRET) as TokenPayload;
