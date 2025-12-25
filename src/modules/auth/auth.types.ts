import mongoose from "mongoose";
import { UserRole } from "../user/user.types";

export interface TokenPayload {
  id: mongoose.Types.ObjectId;
  role: UserRole;
  tokenVersion: number;
}
