import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import { Phone } from "./database/vnPhone.model.js";
import { normalizePhoneVN } from "./utils.js";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  const FILE_PATH = process.argv[2];
  if (!FILE_PATH) {
    console.error("❌ missing file path.");
    process.exit(1);
  }

  let batch = [];
  let total = 0;

  const stream = fs.createReadStream(FILE_PATH).pipe(csv({ separator: ";" }));

  for await (const row of stream) {
    const cleanRow = {};
    for (const key in row) {
      const cleanedKey = key.trim().replace(/^\uFEFF/, ""); // xóa BOM
      cleanRow[cleanedKey] = row[key];
    }

    const phone = normalizePhoneVN(cleanRow.phone);
    if (phone) {
      batch.push({ id: String(cleanRow.id), uid: cleanRow.uid, phone });
    }

    if (batch.length >= BATCH_SIZE) {
      await Phone.insertMany(batch, { ordered: false }).catch(() => {});
      total += batch.length;
      console.log(`✅ Inserted ${total} rows`);
      batch = [];
    }
  }

  if (batch.length) {
    await Phone.insertMany(batch, { ordered: false }).catch(() => {});
    total += batch.length;
  }

  console.log(`🎉 Done. Inserted total ${total} rows`);
  await mongoose.disconnect();
}

run().catch(console.error);
