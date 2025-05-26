import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { PostsIdCrawlDaily } from "./database/postsIdCrawlDaily.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path.");
    process.exit(1);
  }

  // 1. Kết nối MongoDB
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // 2. Đọc và giải mã file CSV (UTF-8)
  const raw = fs.readFileSync(FILE_PATH);
  const csv = iconv.decode(raw, "utf8");

  // 3. Dùng xlsx parse CSV với dấu phân tách ";"
  const wb = xlsx.read(csv, { type: "string", FS: ";" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // 4. Chuyển mỗi dòng thành document
  const docs = rows
    .map(r => {
      // bắt buộc có postId và pageId ít nhất
      if (!r.postId) return null;
      return {
        postId:         String(r.postId).trim(),
        pageId:         String(r.pageId || "").trim() || undefined,
        createDate:     r.createDate ? new Date(r.createDate) : undefined,
        content:        String(r.content || "").trim(),
        type:           String(r.type || "").trim(),
        image_url:      String(r.image_url || "").trim(),
        status:         Number(r.status) || 0,
      };
    })
    .filter(d => d);

  console.log(`📥 Prepared ${docs.length} documents (${rows.length} total rows)`);

  // 5. Insert theo batch
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await PostsIdCrawlDaily.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${i/BATCH_SIZE + 1}: Inserted ${res.length}`);
    } catch (err) {
      if (err.writeErrors) {
        const inserted = err.result?.nInserted ?? 0;
        console.warn(`⚠️ Batch ${i/BATCH_SIZE + 1}: Inserted ${inserted}, skipped duplicates`);
      } else {
        console.error(`❌ Batch ${i/BATCH_SIZE + 1} error:`, err.message);
      }
    }
  }

  console.log(`🎉 Import completed (${docs.length} docs).`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
