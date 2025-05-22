import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { Post } from "./database/post.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path argument.");
    process.exit(1);
  }

  // 1. Kết nối tới MongoDB
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // 2. Đọc CSV (UTF-8) và decode
  const raw = fs.readFileSync(FILE_PATH);
  const csv = iconv.decode(raw, "utf8");

  // 3. Đọc bằng xlsx với dấu phân tách ;
  const wb = xlsx.read(csv, { type: "string", FS: ";" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // 4. Map sang document theo schema
  const docs = rows
    .map(r => ({
      id: String(r.id),
      pageId: String(r.pageId),
      date: r.date ? new Date(r.date) : undefined,
      content: r.content || null,

      totalOfComment: Number(r.totalOfComment) || 0,
      totalOfShare: Number(r.totalOfShare) || 0,
      totalOfReaction: Number(r.totalOfReaction) || 0,
      reactionLink: r.reactionLink || null,

      type: r.type || null,

      totalOfClicks: Number(r.totalOfClicks) || 0,
      totalOfViews: Number(r.totalOfViews) || 0,
    }))
    .filter(doc => doc.id);  // chỉ giữ những dòng có id

  console.log(`📥 Prepared ${docs.length} posts (${rows.length} total rows)`);

  // 5. Batch insert, skip duplicates
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await Post.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${i/BATCH_SIZE + 1}: Inserted ${res.length}`);
    } catch (err) {
      if (err.writeErrors) {
        const inserted = err.result?.nInserted || 0;
        console.warn(`⚠️ Batch ${i/BATCH_SIZE + 1}: Inserted ${inserted}, skipped duplicates`);
      } else {
        console.error(`❌ Batch ${i/BATCH_SIZE + 1} error:`, err.message);
      }
    }
  }

  console.log(`🎉 Import completed (${docs.length} posts).`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
