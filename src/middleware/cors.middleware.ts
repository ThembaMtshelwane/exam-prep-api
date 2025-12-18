import cors from "cors";
import { ENV_VARS } from "../consts/env.const";

const getAllowedOrigins = (): string[] => {
  const origins = [ENV_VARS.CLIENT_URL];

  if (ENV_VARS.NODE_ENV === "development") {
    origins.push(ENV_VARS.DEV_CLIENT_URL);
  }
  return origins;
};
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export const corsMiddleware = cors(corsOptions);
