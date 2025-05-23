import mongoose from "mongoose";

const tagConfigSentimentSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true }, // từ postId
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
  },
  {
    timestamps: true, // tạo createdAt & updatedAt tự động
  }
);

export const TagConfigSentiment = mongoose.model(
  "TagConfigSentiment",
  tagConfigSentimentSchema
);
