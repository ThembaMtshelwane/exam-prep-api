import jwt from "jsonwebtoken";
import { IUser } from "../modules/user/user.types";
import { ENV_VARS } from "../consts/env.const";

export const generateAccessToken = (user: IUser): string => {
  const secret = user.access_token_secret + ENV_VARS.GLOBAL_ACCESS_SECRET;
  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (user: IUser): string => {
  const secret = user.refresh_token_secret + ENV_VARS.GLOBAL_REFRESH_SECRET;
  return jwt.sign({ id: user._id, role: user.role }, secret, {
    expiresIn: "7d",
  });
};

