import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { PageConfigBrandfit } from "./database/pageConfigBrandfit.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // Đọc file CSV (UTF-8)
  const raw = fs.readFileSync(FILE_PATH);
  const content = iconv.decode(raw, "utf8");

  // Đọc bằng xlsx, thiết lập delimiter là ;
  const wb = xlsx.read(content, { type: "string", FS: ";" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // Chỉ lấy cột `name`, loại bỏ hàng không có name
  const docs = rows
    .map((r) => {
      return {
        id: String(r.id),
        name: r.name && r.name.trim(),
        createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
      };
    })
    .filter((r) => r?.name)

  console.log(`📥 Prepared ${docs.length} docs (${rows.length} total rows)`);

  // Batch insert với skip duplicates (unique index)
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await PageConfigBrandfit.insertMany(batch, {
        ordered: false,
      });
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

  console.log(`🎉 Import completed (${docs.length} docs).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
