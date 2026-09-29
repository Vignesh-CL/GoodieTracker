import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["draft", "active", "completed", "cancelled"], default: "draft" },
    goodies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Goodie" }],
  },
  { timestamps: true },
);

export default mongoose.model("Event", eventSchema);
