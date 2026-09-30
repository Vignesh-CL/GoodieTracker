import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import Distribution from "./models/Distribution.js";
import Event from "./models/Event.js";
import Goodie from "./models/Goodie.js";
import User from "./models/User.js";

await connectDatabase();
const records = await Distribution.find({
  $or: [{ employeeName: { $exists: false } }, { goodieName: { $exists: false } }, { eventName: { $exists: false } }],
});

for (const record of records) {
  const [employee, goodie, event] = await Promise.all([
    User.findById(record.employee).select("name employeeCode"),
    Goodie.findById(record.goodie).select("name"),
    Event.findById(record.event).select("name"),
  ]);
  record.employeeName = employee?.name || "Unknown employee";
  record.employeeCode = employee?.employeeCode || "";
  record.goodieName = goodie?.name || "Unknown goodie";
  record.eventName = event?.name || "Unknown event";
  if (!record.status) record.status = "received";
  if (!record.statusUpdatedAt) record.statusUpdatedAt = record.updatedAt || record.distributedAt || new Date();
  await record.save({ validateModifiedOnly: true });
}

console.log(`Backfilled ${records.length} distribution records.`);
await mongoose.disconnect();
