import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Test API is running successfully.",
  });
});

export default router;
