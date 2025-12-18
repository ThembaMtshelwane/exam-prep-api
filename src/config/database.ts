import mongoose from "mongoose";
import { ENV_VARS } from "../consts/env.const";

export const connectDatabase = async (uri:string) => {
  try {
    await mongoose.connect(uri);
    console.log(`✅ Connected to the ${mongoose.connection.name} database`);
    console.log(` Running in ${ENV_VARS.NODE_ENV} mode`);
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    console.error(error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await mongoose.disconnect();
};
