import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    // _id: { type: String }, // từ SQL: id
    id: { type: String, unique: true }, // từ SQL: id
    pageId: { type: String, index: true },
    date: { type: Date, index: true },
    content: { type: String },

    totalOfComment: { type: Number, default: 0 },
    totalOfShare: { type: Number, default: 0 },
    totalOfReaction: { type: Number, default: 0 },
    reactionLink: { type: String },

    type: { type: String },

    totalOfClicks: { type: Number, default: 0 },
    totalOfViews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    // _id: false, // Cho phép dùng id làm _id
  }
);

export const Post = mongoose.model('Post', postSchema);
