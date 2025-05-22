import mongoose from 'mongoose';

const pageConfigBrandfitSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, },
  },
  {
    timestamps: true, // tự động tạo createdAt & updatedAt
  }
);

export const PageConfigBrandfit = mongoose.model('PageConfigBrandfit', pageConfigBrandfitSchema);
