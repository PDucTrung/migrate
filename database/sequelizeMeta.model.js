import mongoose from 'mongoose';

const sequelizeMetaSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, }, // từ trường name trong SQL
  },
  {
    timestamps: false, 
  }
);

export const SequelizeMeta = mongoose.model('SequelizeMeta', sequelizeMetaSchema);
