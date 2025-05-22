import mongoose from "mongoose";
import mongooseLong from "mongoose-long";

mongooseLong(mongoose);
const {
  Types: { Long },
} = mongoose;

const insightSchema = new mongoose.Schema(
  {
    id: { type: Long, required: true, unique: true }, // tương đương `Id` bigint unsigned, auto-increment bên MySQL
    uid: { type: Long, required: true, index: true }, // tương đương `Uid` bigint unsigned
    group: { type: String }, // tương đương `Group` varchar(255)
    name: { type: String }, // tương đương `Name` text
    type: { type: String, index: true }, // tương đương `Type` varchar(200)
  },
  {
    timestamps: true,
  }
);

export const Insight = mongoose.model("Insight", insightSchema);
