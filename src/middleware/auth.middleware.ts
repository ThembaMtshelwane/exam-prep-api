import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  // Format: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Token required" });

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Attach user info (ID/Role) to the request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired access token" });
  }
};

// Authorization: Checks if the user has the specific role required
export const authorize = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Permission denied" });
    }
    next();
  };
};
