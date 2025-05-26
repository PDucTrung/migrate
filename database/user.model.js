import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String }, // từ SQL: id
    uid: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    name: { type: String, index: true },
    sex: { type: String, maxlength: 20 },
    location: { type: String },
    friends: { type: Number, default: 0 },
    follow: { type: Number, default: 0 },
    birthday: { type: Date, index: true },
    relationship: { type: String },
    email: { type: String, index: true },
    note: { type: String, index: true },
    phone2: { type: String, index: true },
    fullname: { type: String, index: true },
    cmnd: { type: String, index: true },
    city: { type: String, index: true },
    address: { type: String, index: true },
    car: { type: String },
    bank: { type: String },
    income: { type: String },
    house: { type: String },
    children: { type: Number },
    title: { type: String },
    company: { type: String },
    type: { type: Number },
    note2: { type: mongoose.Schema.Types.Mixed },
    note3: { type: mongoose.Schema.Types.Mixed },
    note4: { type: mongoose.Schema.Types.Mixed },
    note5: { type: mongoose.Schema.Types.Mixed },
    note6: { type: mongoose.Schema.Types.Mixed },
    note7: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("user", userSchema);
