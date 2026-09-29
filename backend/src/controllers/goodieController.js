import Goodie from "../models/Goodie.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listGoodies = asyncHandler(async (_request, response) => response.json(await Goodie.find({ active: true }).sort({ createdAt: -1 })));
export const createGoodie = asyncHandler(async (request, response) => response.status(201).json(await Goodie.create(request.body)));
export const updateGoodie = asyncHandler(async (request, response) => {
  const goodie = await Goodie.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
  if (!goodie) return response.status(404).json({ message: "Goodie not found" });
  response.json(goodie);
});
export const deactivateGoodie = asyncHandler(async (request, response) => response.json(await Goodie.findByIdAndUpdate(request.params.id, { active: false }, { new: true })));
