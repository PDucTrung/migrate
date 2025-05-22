import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true }, // từ trường id trong SQL
    // _id: { type: String }, // từ trường id trong SQL
    userName: { type: String, index: true },
    isActive: {
      type: Number,
      enum: [0, 1, null],
      default: null
    },
    status: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    // _id: false, // Cho phép dùng id tự gán làm _id
  }
);

export const Page = mongoose.model("Page", pageSchema);
