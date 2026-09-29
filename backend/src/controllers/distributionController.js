import Distribution from "../models/Distribution.js";
import Event from "../models/Event.js";
import Goodie from "../models/Goodie.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listDistributions = asyncHandler(async (_request, response) => {
  const records = await Distribution.find().populate("employee goodie event recordedBy").sort({ distributedAt: -1 });
  response.json(records);
});

export const createDistribution = asyncHandler(async (request, response) => {
  const { employee, goodie, event, quantity = 1 } = request.body;
  const [employeeRecord, goodieRecord, eventRecord] = await Promise.all([User.findOne({ _id: employee, role: "employee", status: "active" }), Goodie.findOne({ _id: goodie, active: true }), Event.findOne({ _id: event, status: { $in: ["draft", "active"] } })]);
  if (!employeeRecord) return response.status(400).json({ message: "Eligible active employee not found" });
  if (!goodieRecord || goodieRecord.stock < quantity) return response.status(400).json({ message: "Insufficient goodie inventory" });
  if (!eventRecord) return response.status(400).json({ message: "Event is unavailable" });
  const alreadyDistributed = await Distribution.exists({ employee, goodie, event });
  if (alreadyDistributed) return response.status(409).json({ message: "This goodie is already recorded for the employee in this event" });
  const updatedGoodie = await Goodie.findOneAndUpdate({ _id: goodie, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
  if (!updatedGoodie) return response.status(409).json({ message: "Inventory changed; please retry" });
  try {
    const record = await Distribution.create({ employee, goodie, event, quantity, recordedBy: request.user._id });
    response.status(201).json(await record.populate("employee goodie event recordedBy"));
  } catch (error) {
    await Goodie.findByIdAndUpdate(goodie, { $inc: { stock: quantity } });
    throw error;
  }
});
