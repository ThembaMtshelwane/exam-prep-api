import { Router } from "express";
import itemRoutes from "../modules/item/item.routes"; // Example route
import authRoutes from "../modules/auth/auth.routes"; // Example route

const router = Router();

router.get("/", (req, res) => {
  res.json({
    message: "Test API is running successfully.",
  });
});
router.use('/auth', authRoutes)
router.use("/items", itemRoutes);

export default router;
