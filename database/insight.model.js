import mongoose from "mongoose";
import mongooseLong from "mongoose-long";

mongooseLong(mongoose);
const {
  Types: { Long },
} = mongoose;

const insightSchema = new mongoose.Schema(
  {
    id: { type: String }, // từ SQL: id
    uid: { type: String, required: true, index: true },
    group: { type: String }, // tương đương `Group` varchar(255)
    name: { type: String }, // tương đương `Name` text
    type: { type: String, index: true }, // tương đương `Type` varchar(200)
  },
  {
    timestamps: true,
  }
);

export const Insight = mongoose.model("Insight", insightSchema);
