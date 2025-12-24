import { z } from "zod";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// ✅ Define the schema
const ENV_SCHEMA = z.object({
  PORT: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val >= 5000 && val < 65536, {
      message: "PORT must be a valid number between 5000 and 65535",
    }),
  NODE_ENV: z.enum(["development", "production", "test"]),
  CLIENT_URL: z.url().min(1, "Production client url is required"),
  DEV_CLIENT_URL: z.url().min(1, "Dev client url is required"),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  GLOBAL_ACCESS_SECRET: z
    .string()
    .min(10, "Global access secret value must be at least 10 characters long"),
  GLOBAL_REFRESH_SECRET: z
    .string()
    .min(10, "Global refresh secret value must be at least 10 characters long"),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
});

// ✅ Infer the type from Zod
export type EnvVars = z.infer<typeof ENV_SCHEMA>;

// ✅ Parse once, export validated env
export const ENV_VARS: EnvVars = ENV_SCHEMA.parse({
  PORT: process.env.PORT ?? "9000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
  DEV_CLIENT_URL: process.env.DEV_CLIENT_URL ?? "http://localhost:3000",
  MONGO_URI: process.env.MONGO_URI ?? "mongodb://localhost:27017/exam-prep-db",
  GLOBAL_ACCESS_SECRET:
    process.env.GLOBAL_SECRET ?? crypto.randomBytes(32).toString("hex"),
  GLOBAL_REFRESH_SECRET:
    process.env.GLOBAL_REFRESH_SECRET ?? crypto.randomBytes(32).toString("hex"),
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
});
