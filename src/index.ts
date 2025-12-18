import app from "./app";
import dotenv from "dotenv";
import { ENV_VARS } from "./consts/env.const";
dotenv.config();

app.listen(ENV_VARS.PORT, () => {
  console.log(`Server is running on http://localhost:${ENV_VARS.PORT}/api`);
  console.log(`Environment: ${ENV_VARS.NODE_ENV}`);
});
