import mongoose from 'mongoose';

const postCrawlDailySchema = new mongoose.Schema(
  {
    postId: { type: String, required: true },
    crawlDate: { type: Date, required: true },

    totalReactionUpToCurrent: { type: Number, default: 0 },
    totalShareUpToCurrent: { type: Number, default: 0 },
    totalCommentUpToCurrent: { type: Number, default: 0 },
    totalViewUpToCurrent: { type: Number, default: 0 },

    totalReaction: { type: Number, default: 0 },
    totalShare: { type: Number, default: 0 },
    totalComment: { type: Number, default: 0 },
    totalView: { type: Number, default: 0 },
  },
  {
    timestamps: true, // để tự tạo createdAt, updatedAt nếu cần
  }
);

export const PostCrawlDaily = mongoose.model('PostCrawlDaily', postCrawlDailySchema);
