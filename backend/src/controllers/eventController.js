import Event from "../models/Event.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listEvents = asyncHandler(async (_request, response) => response.json(await Event.find().populate("goodies").sort({ date: -1 })));
export const createEvent = asyncHandler(async (request, response) => response.status(201).json(await Event.create(request.body)));
export const updateEvent = asyncHandler(async (request, response) => {
  const event = await Event.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
  if (!event) return response.status(404).json({ message: "Event not found" });
  response.json(event);
});
export const cancelEvent = asyncHandler(async (request, response) => response.json(await Event.findByIdAndUpdate(request.params.id, { status: "cancelled" }, { new: true })));
