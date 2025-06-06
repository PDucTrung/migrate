import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import csv from "csv-parser";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { CommentMeta } from "./database/commentMeta.model.js";

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
    .pipe(csv({ separator: ";", mapHeaders: ({ header }) => header.trim() }));

  let batch = [];
  let total = 0;
  let batchIndex = 0;

  for await (const row of stream) {
    if (!row.commentId) continue;

    const doc = {
      id: String(row.id),
      commentId: String(row.commentId),
      sentimentAuto: row.sentimentAuto || null,
      sentimentManual: row.sentimentManual || null,
      category: row.category || null,
      subCategory: row.subCategory || null,
      brand: row.brand || null,
      brandKeywords: row.brandKeywords || null,
      brandCompetitors: row.brandCompetitors || null,
      generalPositive: row.generalPositive || null,
      generalNeutral: row.generalNeutral || null,
      generalNegative: row.generalNegative || null,
      productType: row.productType || null,
      productAttributePositive: row.productAttributePositive || null,
      productAttributeNeutral: row.productAttributeNeutral || null,
      productAttributeNegative: row.productAttributeNegative || null,
      specialKeywords: row.specialKeywords || null,
      syncedDate: row.syncedDate ? new Date(row.syncedDate) : undefined,
      syncedContent: row.syncedContent || null,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    };

    batch.push(doc);

    if (batch.length >= BATCH_SIZE) {
      batchIndex++;
      try {
        const res = await CommentMeta.insertMany(batch, { ordered: false });
        console.log(`✅ Batch ${batchIndex}: Inserted ${res.length}`);
      } catch (err) {
        const inserted = err.result?.nInserted || 0;
        console.warn(`⚠️ Batch ${batchIndex}: Inserted ${inserted}, skipped dupes`);
      }
      total += batch.length;
      batch = [];
    }
  }

  // Batch còn lại
  if (batch.length > 0) {
    batchIndex++;
    try {
      const res = await CommentMeta.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${batchIndex}: Inserted ${res.length}`);
    } catch (err) {
      const inserted = err.result?.nInserted || 0;
      console.warn(`⚠️ Batch ${batchIndex}: Inserted ${inserted}, skipped dupes`);
    }
    total += batch.length;
  }

  console.log(`🎉 Import completed (${total} commentMeta docs).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
