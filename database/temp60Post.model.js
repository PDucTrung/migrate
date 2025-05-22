import mongoose from "mongoose";

const temp60PostSchema = new mongoose.Schema(
  {
    // _id: { type: String }, // từ SQL: id
    id: { type: String }, // từ SQL: id
  },
  {
    timestamps: false,
    // versionKey: false,
    // _id: false // Cho phép sử dụng id làm _id
  }
);

export const Temp60Post = mongoose.model("Temp60Post", temp60PostSchema);
