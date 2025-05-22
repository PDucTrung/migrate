import dotenv from 'dotenv';
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
export const DB_NAME = process.env.DB_NAME || 'zadmin_listening';
export const BATCH_SIZE = process.env.BATCH_SIZE || 1000;
