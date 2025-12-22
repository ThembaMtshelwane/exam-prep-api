import { Router } from "express";
import { login, logout, refresh, register } from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Public: Users send credentials to get tokens
router.post("/register", register);

// Public: Users send credentials to get tokens
router.post("/login", login);

// Public: Uses the Refresh Token to get a new Access Token
router.post("/refresh", refresh);

// Protected: Requires a valid Access Token to identify the user session
router.post("/logout", authenticate, logout);

export default router;
