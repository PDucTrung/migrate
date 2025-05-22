import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { PostCrawlDaily } from "./database/postCrawlDaily.model.js";

const FILE_PATH = process.argv[2];

function toNumber(val) {
  // chuyển string hoặc number thành Number, null→0
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path.");
    process.exit(1);
  }

  // 1. Connect
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // 2. Read & decode CSV (UTF-8)
  const raw = fs.readFileSync(FILE_PATH);
  const csv = iconv.decode(raw, "utf8");

  // 3. Parse với dấu phân tách ";"
  const wb = xlsx.read(csv, { type: "string", FS: ";" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // 4. Chuẩn hóa mỗi dòng thành document
  const docs = rows
    .map(r => {
      if (!r.postId || !r.crawlDate) return null;
      return {
        postId: String(r.postId).trim(),
        crawlDate: new Date(r.crawlDate),

        totalReactionUpToCurrent: toNumber(r.totalReactionUpToCurrent),
        totalShareUpToCurrent:    toNumber(r.totalShareUpToCurrent),
        totalCommentUpToCurrent:  toNumber(r.totalCommentUpToCurrent),
        totalViewUpToCurrent:     toNumber(r.totalViewUpToCurrent),

        totalReaction: toNumber(r.totalReaction),
        totalShare:    toNumber(r.totalShare),
        totalComment:  toNumber(r.totalComment),
        totalView:     toNumber(r.totalView),
      };
    })
    .filter(d => d);

  console.log(`📥 Prepared ${docs.length} documents (${rows.length} total rows)`);

  // 5. Batch insert, skip duplicates (không unique key nên tất cả được insert)
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await PostCrawlDaily.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${i/BATCH_SIZE + 1}: Inserted ${res.length}`);
    } catch (err) {
      if (err.writeErrors) {
        const inserted = err.result?.nInserted ?? 0;
        console.warn(`⚠️ Batch ${i/BATCH_SIZE + 1}: Inserted ${inserted}, skipped some`);
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
