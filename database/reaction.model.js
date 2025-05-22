import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    postId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String },
    reactionText: { type: String },
    reactionValue: { type: Number },
  },
  {
    timestamps: true // tự động createdAt và updatedAt
  }
);

// 🔐 Tạo index duy nhất như PRIMARY KEY (postId, userId)
reactionSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Reaction = mongoose.model('Reaction', reactionSchema);
