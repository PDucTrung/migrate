import mongoose from "mongoose";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { Phone } from "./database/vnPhone.model.js";
import { normalizePhoneVN } from "./utils.js";

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  await Phone.syncIndexes();

  const FILE_PATH = process.argv[2];
  if (!FILE_PATH) {
    console.error("❌ missing file path.");
    process.exit(1);
  }

  const workbook = xlsx.readFile(FILE_PATH); // vnphone.csv
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const validRows = rows
    .map((row) => {
      const phone = normalizePhoneVN(row.phone);
      return phone ? { id: String(row.id), uid: row.uid, phone } : null;
    })
    .filter(Boolean);

  console.log(`📥 Prepared ${validRows.length} valid rows (${rows.length})`);

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    try {
      const result = await Phone.insertMany(batch, { ordered: false });
      console.log(
        `✅ Inserted batch ${i / BATCH_SIZE + 1}: ${result.length} records`
      );
    } catch (err) {
      if (err.writeErrors) {
        const insertedCount = err.result?.result?.nInserted || 0;
        console.log(
          `⚠️ Batch ${
            i / BATCH_SIZE + 1
          }: Some duplicates skipped. Inserted ${insertedCount} records.`
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
