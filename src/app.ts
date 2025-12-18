import express from "express";
import routes from "./routes";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { corsMiddleware } from "./middleware/cors.middleware";

export const createApp = () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(corsMiddleware);

  app.get("/", (req, res) => {
    res.json({
      message: "Hello, World! From Exam Prep API.",
    });
  });
  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
};
