import mongoose from "mongoose";
import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { Page } from "./database/page.model.js";

const FILE_PATH = process.argv[2];

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // Đọc file UTF-8
  const fileBuffer = fs.readFileSync(FILE_PATH);
  const fileContent = iconv.decode(fileBuffer, "utf8");
  const workbook = xlsx.read(fileContent, { type: "string" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const validRows = rows
    .map((row) => {
      // Chuẩn hóa isActive thành 0 | 1 | null
      let isActive = null;
      if (row.isActive === "0" || row.isActive === 0) isActive = 0;
      else if (row.isActive === "1" || row.isActive === 1) isActive = 1;

      return {
        id: row.id?.toString(),
        userName: row.userName?.toString(),
        isActive,
        status: row.status ? parseInt(row.status) : 1,
        createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
        updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
      };
    })
    .filter((r) => r.id); // loại dòng không có id

  console.log(`📥 Prepared ${validRows.length} valid rows (${rows.length} total)`);

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    try {
      const result = await Page.insertMany(batch, { ordered: false });
      console.log(`✅ Inserted batch ${i / BATCH_SIZE + 1}: ${result.length} records`);
    } catch (err) {
      if (err.writeErrors) {
        const insertedCount = err.result?.result?.nInserted || 0;
        console.log(
          `⚠️ Batch ${i / BATCH_SIZE + 1}: Some duplicates skipped. Inserted ${insertedCount} records.`
        );
      } else {
        console.error(`❌ Error in batch ${i / BATCH_SIZE + 1}:`, err.message);
      }
    }
  }

  console.log(`🎉 Import ${validRows.length} rows completed.`);
  await mongoose.disconnect();
}

run().catch(console.error);
