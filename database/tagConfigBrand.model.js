import mongoose from 'mongoose';

const tagConfigBrandSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, index: true },
    subCategoryId: { type: Number, index: true },
    status: { type: Number },
  },
  {
    timestamps: true
  }
);

export const TagConfigBrand = mongoose.model('TagConfigBrand', tagConfigBrandSchema);
