import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (_request, response) => {
  const users = await User.find().sort({ createdAt: -1 });
  response.json(users);
});

export const createUser = asyncHandler(async (request, response) => {
  const user = await User.create(request.body);
  response.status(201).json(user);
});

export const updateUser = asyncHandler(async (request, response) => {
  const updates = { ...request.body };
  if (!updates.password) delete updates.password;
  const user = await User.findByIdAndUpdate(request.params.id, updates, { new: true, runValidators: true });
  if (!user) return response.status(404).json({ message: "User not found" });
  response.json(user);
});

export const deactivateUser = asyncHandler(async (request, response) => {
  const user = await User.findByIdAndUpdate(request.params.id, { status: "inactive" }, { new: true });
  if (!user) return response.status(404).json({ message: "User not found" });
  response.json(user);
});
