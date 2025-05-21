import mongoose from "mongoose";
import xlsx from "xlsx";
import { MONGO_URI, DB_NAME } from "./config/index.js";
import { Phone } from "./database/vnPhone.model.js";
import { normalizePhoneVN } from "./utils.js";

async function run() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  await Phone.syncIndexes();

  const workbook = xlsx.readFile("./data/vnphone.csv"); // vnphone.csv
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const validRows = rows
    .map((row) => {
      const phone = normalizePhoneVN(row.phone);
      return phone ? { uid: row.uid, phone } : null;
    })
    .filter(Boolean);

  try {
    const result = await Phone.insertMany(validRows, { ordered: false });
    console.log(`✅ Inserted ${result.length} new records`);
  } catch (err) {
    if (err.writeErrors) {
      const insertedCount = err.result?.result?.nInserted || 0;
      console.log(
        `⚠️ Some duplicates skipped. Inserted ${insertedCount} records.`
      );
    } else {
      console.error("❌ Insert failed:", err);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
