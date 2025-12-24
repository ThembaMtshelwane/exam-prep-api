import { Document } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  email: string;
  password: string; // Hashed
  role: UserRole;
  access_token_secret: string;
  refresh_token_secret: string;
  tokenVersion: number;

  omitField(field: string): any;
  regenerateJwtSecret(): Promise<void>;
  regenerateRefreshSecret(): Promise<void>;
  regenerateAllSecrets(): Promise<void>;
  invalidateAllTokens(): Promise<void>;
}
