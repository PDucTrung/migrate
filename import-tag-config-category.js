import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { TagConfigCategory } from "./database/tagConfigCategory.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing CSV file path.");
    process.exit(1);
  }

  // 1. Kết nối MongoDB
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // 2. Đọc và decode file CSV (UTF-8) với delimiter ";"
  const raw = fs.readFileSync(FILE_PATH);
  const csvText = iconv.decode(raw, "utf8");
  const workbook = xlsx.read(csvText, { type: "string", FS: ";" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  // 3. Map mỗi dòng thành document TagConfigCategory
  const docs = rows
    .map((r) => {
      if (!r.name) return null;
      return {
        id: String(r.id).trim(),
        name: r.name.toString().trim(),
        parentId:
          r.parentId !== undefined && r.parentId !== ""
            ? Number(r.parentId)
            : undefined,
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      };
    })
    .filter((d) => d);

  console.log(`📥 Prepared ${docs.length} documents from ${rows.length} rows`);

  // 4. Insert theo batch, skip duplicates
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await TagConfigCategory.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${i / BATCH_SIZE + 1}: Inserted ${res.length}`);
    } catch (err) {
      if (err.writeErrors) {
        const inserted = err.result?.nInserted ?? 0;
        console.warn(
          `⚠️ Batch ${i / BATCH_SIZE + 1}: Inserted ${inserted}, skipped dupes`
        );
      } else {
        console.error(`❌ Batch ${i / BATCH_SIZE + 1} error:`, err.message);
      }
    }
  }

  console.log(`🎉 Import completed (${docs.length} TagConfigCategory items).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
