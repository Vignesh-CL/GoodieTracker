import mongoose from "mongoose";

const distributionSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    goodie: { type: mongoose.Schema.Types.ObjectId, ref: "Goodie", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, min: 1, default: 1 },
    distributedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

distributionSchema.index({ employee: 1, event: 1 });
export default mongoose.model("Distribution", distributionSchema);
