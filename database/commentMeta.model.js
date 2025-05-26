import mongoose from "mongoose";

const commentMetaSchema = new mongoose.Schema(
  {
    id: { type: String }, // từ SQL: id
    commentId: { type: String, index: true },
    sentimentAuto: { type: String, index: true },
    sentimentManual: { type: String, index: true },
    category: { type: String, index: true },
    subCategory: { type: String, index: true },
    brand: { type: String, index: true },
    brandKeywords: { type: String },
    brandCompetitors: { type: String },
    generalPositive: { type: String },
    generalNeutral: { type: String },
    generalNegative: { type: String },
    productType: { type: String },
    productAttributePositive: { type: String },
    productAttributeNeutral: { type: String },
    productAttributeNegative: { type: String },
    specialKeywords: { type: String },
    syncedDate: { type: Date, index: true },
    syncedContent: { type: String },
  },
  {
    timestamps: true, // tự tạo createdAt và updatedAt
  }
);

// commentMetaSchema.index({ category: 1, brand: 1 });

export const CommentMeta = mongoose.model("CommentMeta", commentMetaSchema);
