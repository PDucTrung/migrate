// import-insights.js
import mongoose from "mongoose";
import mongooseLong from "mongoose-long";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import iconv from "iconv-lite";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { Insight } from "./database/insight.model.js";

// Kích hoạt Long type
mongooseLong(mongoose);
const {
  Types: { Long },
} = mongoose;

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing CSV file path.");
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
    .pipe(csv({ separator: ";" }));

  let batch = [];
  let total = 0;
  let batchIndex = 0;

  for await (const row of stream) {
    if (!row.Id || !row.Uid) continue;

    const doc = {
      id: String(row.Id).trim(),
      uid: String(row.Uid).trim(),
      group: row.Group?.trim() || undefined,
      name: row.Name?.trim() || undefined,
      type: row.Type?.trim() || undefined,
    };

    batch.push(doc);

    if (batch.length >= BATCH_SIZE) {
      batchIndex++;
      try {
        const res = await Insight.insertMany(batch, { ordered: false });
        console.log(`✅ Batch ${batchIndex}: Inserted ${res.length}`);
      } catch (err) {
        const inserted = err.result?.nInserted ?? 0;
        console.warn(
          `⚠️ Batch ${batchIndex}: Inserted ${inserted}, skipped duplicates`
        );
      }
      total += batch.length;
      batch = [];
    }
  }

  // Insert batch cuối nếu còn
  if (batch.length > 0) {
    batchIndex++;
    try {
      const res = await Insight.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${batchIndex}: Inserted ${res.length}`);
    } catch (err) {
      const inserted = err.result?.nInserted ?? 0;
      console.warn(
        `⚠️ Batch ${batchIndex}: Inserted ${inserted}, skipped duplicates`
      );
    }
    total += batch.length;
  }

  console.log(`🎉 Import completed (${total} insights).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
