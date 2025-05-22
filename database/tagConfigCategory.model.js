import mongoose from 'mongoose';

const tagConfigCategorySchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, index: true },
    parentId: { type: Number }, // giữ kiểu Number để khớp với schema Brand dùng subCategoryId là Number
  },
  {
    timestamps: true,
  }
);

export const TagConfigCategory = mongoose.model('TagConfigCategory', tagConfigCategorySchema);
