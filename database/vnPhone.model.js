import mongoose from "mongoose";

const phoneSchema = new mongoose.Schema(
  {
    id: { type: String }, // từ SQL: id
    uid: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

phoneSchema.index({ uid: 1, phone: 1 }, { unique: true });

export const Phone = mongoose.model("VnPhone", phoneSchema);
