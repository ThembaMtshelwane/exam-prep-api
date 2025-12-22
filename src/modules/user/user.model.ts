import { Schema, Document, model, Model } from "mongoose";

export type UserRole = "user" | "admin";

export interface IUser extends Document {
  email: string;
  password: string; // Hashed
  role: UserRole;
  refreshTokens: string[]; // Store active refresh tokens for rotation/revocation
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  refreshTokens: [String],
});

const User: Model<IUser> = model<IUser>("User", UserSchema);

export default User;
