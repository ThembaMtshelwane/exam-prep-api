import jwt from "jsonwebtoken";
import { IUser } from "../modules/user/user.types";
import { ENV_VARS } from "../consts/env.const";
import { TokenPayload } from "../modules/auth/auth.types";

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
