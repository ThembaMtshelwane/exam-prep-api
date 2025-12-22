import { z } from "zod";
import dotenv from "dotenv";
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
  CLIENT_URL: z.url(),
  DEV_CLIENT_URL: z.url(),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  ACCESS_SECRET: z.string(),
  REFRESH_SECRET: z.string(),
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
  ACCESS_SECRET: process.env.ACCESS_SECRET ?? "",
  REFRESH_SECRET: process.env.REFRESH_SECRET ?? "",
});
