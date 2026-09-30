import mongoose from "mongoose";

const distributionSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeName: { type: String, required: true, trim: true },
    employeeCode: { type: String, default: "", trim: true },
    goodie: { type: mongoose.Schema.Types.ObjectId, ref: "Goodie", required: true },
    goodieName: { type: String, required: true, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    eventName: { type: String, required: true, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, min: 1, default: 1 },
    status: { type: String, enum: ["pending", "received", "cancelled"], default: "pending" },
    distributedAt: { type: Date, default: Date.now },
    statusUpdatedAt: { type: Date, default: Date.now },
    statusUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

distributionSchema.index({ employee: 1, event: 1 });
distributionSchema.index({ status: 1, event: 1 });
export default mongoose.model("Distribution", distributionSchema);
