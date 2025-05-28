import fs from "fs";
import iconv from "iconv-lite";
import xlsx from "xlsx";
import path from "path";
import mongoose from "mongoose";
import { User } from "./database/user.model.js";
import { Phone } from "./database/vnPhone.model.js";
import { UserGroupLink } from "./database/userGroupLink.model.js";
import { MONGO_URI, DB_NAME } from "./config/index.js";
import { normalizePhoneVN } from "./utils.js";

const FILE_PATH = process.argv[2];
if (!FILE_PATH) {
  console.error("❌ missing file path.");
  process.exit(1);
}

// ✅ Kiểm tra định dạng tên file
const baseName = path.basename(FILE_PATH); // → d_100001292170616.csv
const match = baseName.match(/^d_(\d+)\.(csv|xlsx)$/);

if (!match) {
  throw new Error(
    `❌ FILE_PATH incorrect format 'd_<groupId>.csv|xlsx': ${FILE_PATH}`
  );
}

const GROUP_ID = match[1];

// Safe parse helpers
const toSafeInt = (val) => {
  const num = parseInt(val);
  return isNaN(num) ? 0 : num;
};

const toSafeDate = (val) => {
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

async function importUsers() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // Đọc utf8
  const fileBuffer = fs.readFileSync(FILE_PATH);
  const fileContent = iconv.decode(fileBuffer, "utf8");

  const workbook = xlsx.read(fileContent, { type: "string" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  console.log(`📥 Loaded ${rows.length} rows from file ${FILE_PATH}`);

  let index = 0;
  for (const row of rows) {
    const uid = row.Uid?.toString().trim();
    if (!uid) continue;

    let phone = null;
    const found = await Phone.findOne({ uid });
    if (found?.phone) {
      phone = found.phone;
    } else {
      phone = normalizePhoneVN(row.Phone);
    }

    const userData = {
      id: String(row.id),
      uid,
      phone,
      name: row.Name,
      sex: row.Sex,
      location: row.Location,
      friends: toSafeInt(row?.Friends),
      follow: toSafeInt(row?.Follow),
      birthday: toSafeDate(row?.Birthday),
      relationship: row.Relationship,
      email: row.email,
      note: row.Note,
      phone2: row?.Phone2 ? normalizePhoneVN(row.Phone2) : undefined,
      fullname: row.Fullname,
      cmnd: row.Cmnd,
      city: row.City,
      address: row.Address,
      car: row.Car,
      bank: row.Bank,
      income: row.Income,
      house: row.House,
      children: toSafeInt(row?.Children),
      title: row.Title,
      company: row.Company,
      type: toSafeInt(row?.Type),
      note2: row.Note2,
      note3: row.Note3,
      note4: row.Note4,
      note5: row.Note5,
      note6: row.Note6,
      note7: row.Note7,
    };

    try {
      await User.updateOne({ uid }, userData, { upsert: true });
      await UserGroupLink.updateOne(
        { uid, groupId: GROUP_ID },
        { uid, groupId: GROUP_ID },
        { upsert: true }
      );

      index++;
      console.log(`✅ Import User ${uid} - ${row.Name} completed (${index})`);
    } catch (err) {
      console.error(`❌ Error on uid ${uid}:`, err.message);
    }
  }

  console.log(`🎉 Import ${rows.length} rows completed.`);
  await mongoose.disconnect();
}

importUsers().catch(console.error);
