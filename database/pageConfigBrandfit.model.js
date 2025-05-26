import mongoose from "mongoose";

const pageConfigBrandfitSchema = new mongoose.Schema(
  {
    id: { type: String }, // từ SQL: id
    name: { type: String, unique: true },
  },
  {
    timestamps: true, // tự động tạo createdAt & updatedAt
  }
);

export const PageConfigBrandfit = mongoose.model(
  "PageConfigBrandfit",
  pageConfigBrandfitSchema
);
