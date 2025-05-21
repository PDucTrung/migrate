import mongoose from "mongoose";

const userGroupLinkSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, index: true },
    groupId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

userGroupLinkSchema.index({ uid: 1, groupId: 1 }, { unique: true });

export const UserGroupLink = mongoose.model(
  "userGroupLink",
  userGroupLinkSchema
);
