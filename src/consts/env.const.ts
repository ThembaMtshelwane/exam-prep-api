import { z } from "zod";

// ✅ Define the schema
const ENV_SCHEMA = z.object({
  PORT: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => Number.isInteger(val) && val > 0 && val < 65536, {
      message: "PORT must be a valid number between 1 and 65535",
    }),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

// ✅ Infer the type from Zod
export type EnvVars = z.infer<typeof ENV_SCHEMA>;

// ✅ Parse once, export validated env
export const ENV_VARS: EnvVars = ENV_SCHEMA.parse({
  PORT: process.env.PORT ?? "5000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
});
