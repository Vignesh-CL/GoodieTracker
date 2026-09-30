import Event from "../models/Event.js";
import Distribution from "../models/Distribution.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listEvents = asyncHandler(async (_request, response) => response.json(await Event.find().populate("goodies eligibleEmployees").sort({ date: -1 })));
export const listEmployeeEvents = asyncHandler(async (request, response) => {
  const events = await Event.find({
    status: "active",
    $or: [{ eligibleEmployees: { $size: 0 } }, { eligibleEmployees: request.user._id }],
  }).populate("goodies").sort({ date: -1 });
  response.json(events);
});
export const createEvent = asyncHandler(async (request, response) => {
  const event = await Event.create({ ...request.body, status: request.body.status || "draft" });
  response.status(201).json(await event.populate("eligibleEmployees"));
});
export const updateEvent = asyncHandler(async (request, response) => {
  const event = await Event.findByIdAndUpdate(request.params.id, request.body, { new: true, runValidators: true });
  if (!event) return response.status(404).json({ message: "Event not found" });
  response.json(await event.populate("eligibleEmployees"));
});
export const cancelEvent = asyncHandler(async (request, response) => response.json(await Event.findByIdAndUpdate(request.params.id, { status: "cancelled" }, { new: true })));

export const exportDistributions = asyncHandler(async (_request, response) => {
  const records = await Distribution.find().sort({ distributedAt: -1 }).lean();
  const columns = ["Employee", "Employee code", "Event", "Goodie", "Quantity", "Status", "Distributed at"];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = records.map((record) => [record.employeeName, record.employeeCode, record.eventName, record.goodieName, record.quantity, record.status, record.distributedAt ? new Date(record.distributedAt).toISOString() : ""]);
  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", 'attachment; filename="goodietrack-distributions.csv"');
  response.send([columns, ...rows].map((row) => row.map(escape).join(",")).join("\n"));
});
