// import-insights.js
import mongoose from "mongoose";
import mongooseLong from "mongoose-long";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { Insight } from "./database/insight.model.js";

// Kích hoạt Long type
mongooseLong(mongoose);
const { Types: { Long } } = mongoose;

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing CSV file path.");
    process.exit(1);
  }

  // 1. Kết nối MongoDB
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // 2. Đọc và giải mã CSV (UTF-8)
  const raw = fs.readFileSync(FILE_PATH);
  const csvText = iconv.decode(raw, "utf8");

  // 3. Parse CSV với xlsx, delimiter là ";"
  const wb = xlsx.read(csvText, { type: "string", FS: ";" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: "" });

  // 4. Map mỗi dòng thành document Insight
  const docs = rows
    .map(r => {
      if (!r.Id || !r.Uid) return null;
      return {
        id:    Long.fromString(String(r.Id).trim()),
        uid:   Long.fromString(String(r.Uid).trim()),
        group: String(r.Group || "").trim() || undefined,
        name:  String(r.Name || "").trim()  || undefined,
        type:  String(r.Type || "").trim()  || undefined,
      };
    })
    .filter(d => d);

  console.log(`📥 Prepared ${docs.length} documents (${rows.length} rows)`);

  // 5. Insert theo batch
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    try {
      const res = await Insight.insertMany(batch, { ordered: false });
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

  console.log(`🎉 Import completed (${docs.length} insights).`);
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
