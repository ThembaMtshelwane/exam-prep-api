import mongoose from "mongoose";
import { createApp } from "./app";
import dotenv from "dotenv";
import { ENV_VARS } from "./consts/env.const";
dotenv.config();

const start = async () => {
  await mongoose.connect(ENV_VARS.MONGO_URI);

  const app = createApp();
  app.listen(ENV_VARS.PORT, () => {
    console.log(`Server running on port http://localhost:${ENV_VARS.PORT}`);
  });
};

start();
