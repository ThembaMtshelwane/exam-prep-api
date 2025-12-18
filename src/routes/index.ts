import { Router } from "express";
import itemRoutes from "../modules/item/item.routes";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Test API is running successfully.",
  });
});
router.use("/items", itemRoutes);

export default router;
