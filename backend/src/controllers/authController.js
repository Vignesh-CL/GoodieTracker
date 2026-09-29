import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createToken } from "../utils/token.js";

export const login = asyncHandler(async (request, response) => {
  const { email, password } = request.body;
  const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
  if (!user || user.status !== "active" || !(await user.comparePassword(password || ""))) return response.status(401).json({ message: "Invalid email or password" });
  response.json({ token: createToken(user), user: user.toJSON() });
});

export const me = asyncHandler(async (request, response) => response.json({ user: request.user.toJSON() }));
