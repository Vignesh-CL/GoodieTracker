import Distribution from "../models/Distribution.js";
import Event from "../models/Event.js";
import Goodie from "../models/Goodie.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listDistributions = asyncHandler(async (request, response) => {
  const filter = {};
  if (request.query.employee) filter.employee = request.query.employee;
  if (request.query.event) filter.event = request.query.event;
  if (request.query.status) filter.status = request.query.status;
  const records = await Distribution.find(filter).populate("employee goodie event recordedBy statusUpdatedBy").sort({ distributedAt: -1 });
  response.json(records);
});

export const listEmployeeDistributions = asyncHandler(async (request, response) => {
  const records = await Distribution.find({ employee: request.params.employeeId })
    .populate("employee goodie event recordedBy statusUpdatedBy")
    .sort({ distributedAt: -1 });
  response.json(records);
});

export const listMyDistributions = asyncHandler(async (request, response) => {
  const records = await Distribution.find({ employee: request.user._id })
    .populate("employee goodie event recordedBy statusUpdatedBy")
    .sort({ distributedAt: -1 });
  response.json(records);
});

export const createDistribution = asyncHandler(async (request, response) => {
  const { employee, goodie, event, quantity = 1 } = request.body;
  const [employeeRecord, goodieRecord, eventRecord] = await Promise.all([User.findOne({ _id: employee, role: "employee", status: "active" }), Goodie.findOne({ _id: goodie, active: true }), Event.findOne({ _id: event, status: { $in: ["draft", "active"] } })]);
  if (!employeeRecord) return response.status(400).json({ message: "Eligible active employee not found" });
  if (!goodieRecord || goodieRecord.stock < quantity) return response.status(400).json({ message: "Insufficient goodie inventory" });
  if (!eventRecord) return response.status(400).json({ message: "Event is unavailable" });
  if (eventRecord.eligibleEmployees.length && !eventRecord.eligibleEmployees.some((eligibleEmployee) => eligibleEmployee.equals(employee))) {
    return response.status(400).json({ message: "This employee is not eligible for the selected event" });
  }
  const alreadyDistributed = await Distribution.exists({ employee, goodie, event });
  if (alreadyDistributed) return response.status(409).json({ message: "This goodie is already recorded for the employee in this event" });
  const updatedGoodie = await Goodie.findOneAndUpdate({ _id: goodie, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
  if (!updatedGoodie) return response.status(409).json({ message: "Inventory changed; please retry" });
  try {
    const record = await Distribution.create({
      employee,
      employeeName: employeeRecord.name,
      employeeCode: employeeRecord.employeeCode,
      goodie,
      goodieName: goodieRecord.name,
      event,
      eventName: eventRecord.name,
      quantity,
      status: "pending",
      recordedBy: request.user._id,
      statusUpdatedBy: request.user._id,
    });
    response.status(201).json(await record.populate("employee goodie event recordedBy"));
  } catch (error) {
    await Goodie.findByIdAndUpdate(goodie, { $inc: { stock: quantity } });
    throw error;
  }
});

export const updateDistributionStatus = asyncHandler(async (request, response) => {
  const { status } = request.body;
  if (!["pending", "received", "cancelled"].includes(status)) {
    return response.status(400).json({ message: "Status must be pending, received, or cancelled" });
  }
  const record = await Distribution.findById(request.params.id);
  if (!record) return response.status(404).json({ message: "Distribution not found" });
  if (record.status === "cancelled" && status !== "cancelled") {
    return response.status(409).json({ message: "Cancelled distributions cannot be reopened" });
  }
  if (record.status !== "cancelled" && status === "cancelled") {
    const restored = await Goodie.findOneAndUpdate(
      { _id: record.goodie },
      { $inc: { stock: record.quantity } },
      { new: true },
    );
    if (!restored) return response.status(404).json({ message: "Goodie not found" });
  }
  if (!record.employeeName || !record.goodieName || !record.eventName) {
    const [employeeRecord, goodieRecord, eventRecord] = await Promise.all([
      User.findById(record.employee).select("name employeeCode"),
      Goodie.findById(record.goodie).select("name"),
      Event.findById(record.event).select("name"),
    ]);
    record.employeeName = employeeRecord?.name || record.employeeName || "Unknown employee";
    record.employeeCode = employeeRecord?.employeeCode || record.employeeCode || "";
    record.goodieName = goodieRecord?.name || record.goodieName || "Unknown goodie";
    record.eventName = eventRecord?.name || record.eventName || "Unknown event";
  }
  record.status = status;
  record.statusUpdatedAt = new Date();
  record.statusUpdatedBy = request.user._id;
  await record.save();
  response.json(await record.populate("employee goodie event recordedBy statusUpdatedBy"));
});
