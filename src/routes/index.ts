import { Router } from "express";
import itemRoutes from "../modules/item/item.routes";
import authRoutes from "../modules/auth/auth.routes";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Test API is running successfully.",
  });
});
router.use('/auth', authRoutes)
router.use("/items", itemRoutes);

export default router;
