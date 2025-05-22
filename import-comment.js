import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { Comment } from "./database/comment.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path argument.");
    process.exit(1);
  }

  // 1. Kết nối
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // 2. Đọc file CSV UTF-8
  const raw = fs.readFileSync(FILE_PATH);
  const csv = iconv.decode(raw, "utf8");

  // 3. Đọc với xlsx, ép delimiter là ';'
  const wb = xlsx.read(csv, { type: "string", FS: ";" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // 4. Map sang docs
  const docs = rows
    .map(r => {
      // chuyển empty string thành null hoặc bỏ luôn
      const isNoText = r.isNoTextContent === "0"
        ? 0
        : r.isNoTextContent === "1"
        ? 1
        : null;

      return {
        id: String(r.id),
        postId: String(r.postId),
        parentCommentId: r.parentCommentId ? String(r.parentCommentId) : null,
        date: r.date ? new Date(r.date) : undefined,
        content: r.content || "",
        isNoTextContent: isNoText,
        userId: r.userId ? String(r.userId) : null,
        userName: r.userName || null,
        // createdAt/updatedAt do mongoose tự generate,
        // nếu muốn dùng timestamp từ CSV, uncomment:
        // createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
        // updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
      };
    })
    .filter(doc => doc.id && doc.postId); // tối thiểu cần id + postId

  console.log(`📥 Prepared ${docs.length} comments (${rows.length} total rows)`);

  // 5. Batch insert, skip duplicates
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await Comment.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${i / BATCH_SIZE + 1}: Inserted ${res.length}`);
    } catch (err) {
      if (err.writeErrors) {
        const inserted = err.result?.nInserted || 0;
        console.warn(`⚠️ Batch ${i/BATCH_SIZE +1}: Inserted ${inserted}, skipped dupes`);
      } else {
        console.error(`❌ Batch ${i/BATCH_SIZE +1} error:`, err.message);
      }
    }
  }

  console.log(`🎉 Import completed (${docs.length} comments).`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
