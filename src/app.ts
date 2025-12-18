import express from "express";
import cors from "cors";
import router from "./routes";
import { errorHandler, notFound } from "./middleware/error.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.get("/", (req, res) => {
  res.json({
    message: "Hello, World! From Exam Prep API.",
  });
});
app.use("/api", router);

app.use(notFound);
app.use(errorHandler)

export default app;
