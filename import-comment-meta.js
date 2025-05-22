import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { CommentMeta } from "./database/commentMeta.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path argument.");
    process.exit(1);
  }

  // 1. Kết nối
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // 2. Đọc CSV UTF-8
  const raw = fs.readFileSync(FILE_PATH);
  const csv = iconv.decode(raw, "utf8");

  // 3. Đọc bằng xlsx với delimiter ;
  const wb = xlsx.read(csv, { type: "string", FS: ";" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // 4. Map sang docs
  const docs = rows
    .map((r) => ({
      commentId: String(r.commentId),
      sentimentAuto: r.sentimentAuto || null,
      sentimentManual: r.sentimentManual || null,
      category: r.category || null,
      subCategory: r.subCategory || null,
      brand: r.brand || null,
      brandKeywords: r.brandKeywords || null,
      brandCompetitors: r.brandCompetitors || null,
      generalPositive: r.generalPositive || null,
      generalNeutral: r.generalNeutral || null,
      generalNegative: r.generalNegative || null,
      productType: r.productType || null,
      productAttributePositive: r.productAttributePositive || null,
      productAttributeNeutral: r.productAttributeNeutral || null,
      productAttributeNegative: r.productAttributeNegative || null,
      specialKeywords: r.specialKeywords || null,
      syncedDate: r.syncedDate ? new Date(r.syncedDate) : undefined,
      syncedContent: r.syncedContent || null,
      createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
    }))
    .filter((doc) => doc.commentId); // tối thiểu phải có commentId

  console.log(
    `📥 Prepared ${docs.length} meta-docs (${rows.length} total rows)`
  );

  // 5. Batch insert, skip duplicates
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await CommentMeta.insertMany(batch, { ordered: false });
      console.log(`✅ Batch ${i / BATCH_SIZE + 1}: Inserted ${res.length}`);
    } catch (err) {
      if (err.writeErrors) {
        const inserted = err.result?.nInserted || 0;
        console.warn(
          `⚠️ Batch ${i / BATCH_SIZE + 1}: Inserted ${inserted}, skipped dupes`
        );
      } else {
        console.error(`❌ Batch ${i / BATCH_SIZE + 1} error:`, err.message);
      }
    }
  }

  console.log(`🎉 Import completed (${docs.length} commentMeta docs).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
