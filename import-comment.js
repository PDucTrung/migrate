import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import csv from "csv-parser";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { Comment } from "./database/comment.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path argument.");
    process.exit(1);
  }

  if (!fs.existsSync(FILE_PATH)) {
    console.error("❌ File not found:", FILE_PATH);
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  const stream = fs
    .createReadStream(FILE_PATH)
    .pipe(iconv.decodeStream("utf8"))
    .pipe(csv({ separator: ";", skipLines: 0, mapHeaders: ({ header }) => header.trim() }));

  let batch = [];
  let total = 0;
  let batchIndex = 0;

  for await (const row of stream) {
    if (!row.id || !row.postId) continue;

    const isNoText = row.isNoTextContent === "0"
      ? 0
      : row.isNoTextContent === "1"
      ? 1
      : null;

    const doc = {
      id: String(row.id),
      postId: String(row.postId),
      parentCommentId: row.parentCommentId ? String(row.parentCommentId) : null,
      date: row.date ? new Date(row.date) : undefined,
      content: row.content || "",
      isNoTextContent: isNoText,
      userId: row.userId ? String(row.userId) : null,
      userName: row.userName || null,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    };

    batch.push(doc);

    if (batch.length >= BATCH_SIZE) {
      batchIndex++;
      try {
        const res = await Comment.insertMany(batch, { ordered: false });
        console.log(`✅ Batch ${batchIndex}: Inserted ${res.length}`);
      } catch (err) {
        const inserted = err.result?.nInserted ?? 0;
        console.warn(`⚠️ Batch ${batchIndex}: Inserted ${inserted}, skipped dupes`);
      }
      total += batch.length;
      batch = [];
    }
  }

  // Insert batch còn lại
  if (batch.length > 0) {
    batchIndex++;
    try {
      const res = await Comment.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${batchIndex}: Inserted ${res.length}`);
    } catch (err) {
      const inserted = err.result?.nInserted ?? 0;
      console.warn(`⚠️ Batch ${batchIndex}: Inserted ${inserted}, skipped dupes`);
    }
    total += batch.length;
  }

  console.log(`🎉 Import completed (${total} comments).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
