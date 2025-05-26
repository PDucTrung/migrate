import mongoose from "mongoose";

const postMetaSchema = new mongoose.Schema(
  {
    id: { type: String }, // từ SQL: id
    postId: { type: String, required: true, unique: true, index: true },
    sentimentAuto: { type: String },
    sentimentManual: { type: String },
    category: { type: String },
    subCategory: { type: String },
    brand: { type: String },
  },
  {
    timestamps: true, // tạo createdAt và updatedAt tự động
  }
);

export const PostMeta = mongoose.model("PostMeta", postMetaSchema);
