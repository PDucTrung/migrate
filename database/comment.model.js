import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // _id: { type: String }, // từ SQL: id
    id: { type: String, unique: true }, // từ SQL: id
    postId: { type: String, index: true },
    parentCommentId: { type: String },
    date: { type: Date, index: true },
    content: { type: String },
    isNoTextContent: {
      type: Number,
      enum: [0, 1, null],
      default: null,
    },
    userId: { type: String },
    userName: { type: String },
  },
  {
    timestamps: true, // tự động tạo createdAt & updatedAt
    // _id: false,       // để dùng id dạng string làm _id
  }
);

export const Comment = mongoose.model("Comment", commentSchema);
