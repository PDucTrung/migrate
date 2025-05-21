import mongoose from "mongoose";

const phoneSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

phoneSchema.index({ uid: 1, phone: 1 }, { unique: true });

export const Phone = mongoose.model("VnPhone", phoneSchema);
