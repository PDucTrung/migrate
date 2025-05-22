import mongoose from "mongoose";

const tempNot60PostSchema = new mongoose.Schema(
  {
    // _id: { type: String }, // từ SQL: id
    id: { type: String }, // từ SQL: id
  },
  {
    timestamps: false,
    // versionKey: false,
    // _id: false // Cho phép dùng id làm _id
  }
);

export const TempNot60Post = mongoose.model(
  "TempNot60Post",
  tempNot60PostSchema
);
