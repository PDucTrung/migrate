import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { PostMeta } from "./database/postMeta.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path.");
    process.exit(1);
  }

  // 1. Kết nối MongoDB
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // 2. Đọc CSV (UTF-8) và decode
  const raw = fs.readFileSync(FILE_PATH);
  const csv = iconv.decode(raw, "utf8");

  // 3. Parse file có dấu phân tách ";"
  const wb = xlsx.read(csv, { type: "string", FS: ";" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // 4. Map mỗi dòng thành document theo schema
  const docs = rows
    .map((r) => ({
      postId: String(r.postId),
      sentimentAuto: r.sentimentAuto || null,
      sentimentManual: r.sentimentManual || null,
      category: r.category || null,
      subCategory: r.subCategory || null,
      brand: r.brand || null,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
    }))
    .filter((doc) => doc.postId);

  console.log(
    `📥 Prepared ${docs.length} valid docs (${rows.length} total rows)`
  );

  // 5. Batch insert, skip duplicates trên postId
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await PostMeta.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${i / BATCH_SIZE + 1}: Inserted ${res.length}`);
    } catch (err) {
      if (err.writeErrors) {
        const inserted = err.result?.nInserted || 0;
        console.warn(
          `⚠️ Batch ${
            i / BATCH_SIZE + 1
          }: Inserted ${inserted}, skipped duplicates`
        );
      } else {
        console.error(`❌ Batch ${i / BATCH_SIZE + 1} error:`, err.message);
      }
    }
  }

  console.log(`🎉 Import completed (${docs.length} docs).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
