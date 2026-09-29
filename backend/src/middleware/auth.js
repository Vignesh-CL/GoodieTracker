import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (request, response, next) => {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return response.status(401).json({ message: "Authentication required" });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || user.status !== "active") return response.status(401).json({ message: "User is inactive or unavailable" });
    request.user = user;
    next();
  } catch {
    return response.status(401).json({ message: "Invalid or expired token" });
  }
});

export function allowRoles(...roles) {
  return (request, response, next) => {
    if (!roles.includes(request.user.role)) return response.status(403).json({ message: "You do not have permission for this action" });
    next();
  };
}
