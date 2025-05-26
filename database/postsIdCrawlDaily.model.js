import mongoose from 'mongoose';

const postsIdCrawlDailySchema = new mongoose.Schema(
  {
    // _id: { type: String }, // từ postId
    postId: { type: String }, // từ postId
    pageId: { type: String },
    createDate: { type: Date },
    content: { type: String },
    type: { type: String },
    image_url: { type: String },
    status: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    // _id: false // Cho phép dùng postId làm _id
  }
);

export const PostsIdCrawlDaily = mongoose.model('PostsIdCrawlDaily', postsIdCrawlDailySchema);
