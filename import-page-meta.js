import mongoose from "mongoose";
import fs from "fs";
import xlsx from "xlsx";
import iconv from "iconv-lite";
import { MONGO_URI, DB_NAME, BATCH_SIZE } from "./config/index.js";
import { PageMeta } from "./database/pageMeta.model.js"; // đổi tên model

const FILE_PATH = process.argv[2];

// function tryParseJSON(value) {
//   if (typeof value !== "string") return value;
//   value = value.trim();
//   if (
//     (value.startsWith("[") && value.endsWith("]")) ||
//     (value.startsWith("{") && value.endsWith("}"))
//   ) {
//     try {
//       return JSON.parse(value);
//     } catch {
//       return value;
//     }
//   }
//   return value;
// }

function toNumber(val) {
  const n = Number(val);
  return isNaN(n) ? undefined : n;
}

async function run() {
  if (!FILE_PATH) {
    console.error("❌ Missing file path.");
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
  console.log("✅ Connected to MongoDB");

  // Đọc file CSV (UTF-8 hoặc có BOM)
  const raw = fs.readFileSync(FILE_PATH);
  const content = iconv.decode(raw, "utf8");
  const workbook = xlsx.read(content, {
    type: "string",
    FS: ";",
  });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const validRows = rows
    .map((row) => {
      // Chuẩn hóa isActive về 0|1|null
      let isActive = null;
      if (row.isActive === "0") isActive = 0;
      else if (row.isActive === "1") isActive = 1;

      return {
        pageId: row.pageId,

        brand: (row.brand),
        category: (row.category),
        subCategory: (row.subCategory),

        costPerPostFrom: toNumber(row.costPerPostFrom),
        costPerPostTo: toNumber(row.costPerPostTo),
        totalOfLike: toNumber(row.totalOfLike),
        totalOfFollow: toNumber(row.totalOfFollow),

        dob: row.dob ? new Date(row.dob) : undefined,
        fullName: row.fullName,
        gender: row.gender || undefined,
        location: row.location || undefined,
        professional: row.professional || undefined,
        imageStyle: (row.imageStyle),
        tonality: (row.tonality),
        personality: (row.personality),
        competitors: row.competitors || undefined,
        creativeQuantity: toNumber(row.creativeQuantity),

        authenticity: toNumber(row.authenticity),
        audienceMastery: toNumber(row.audienceMastery),
        collaborative: toNumber(row.collaborative),
        collaborationProfessional: toNumber(row.collaborationProfessional),
        justifiableCost: toNumber(row.justifiableCost),
        longTermPartnership: toNumber(row.longTermPartnership),

        totalFollower: toNumber(row.totalFollower),
        activeFollower: toNumber(row.activeFollower),
        realUser: toNumber(row.realUser),

        audienceMale: toNumber(row.audienceMale),
        audienceFemale: toNumber(row.audienceFemale),
        audienceHN: toNumber(row.audienceHN),
        audienceHCM: toNumber(row.audienceHCM),
        audienceOther: toNumber(row.audienceOther),

        rageAge: (row.rageAge),

        totalPost: toNumber(row.totalPost),
        brandedPostPerTotalPost: toNumber(row.brandedPostPerTotalPost),
        avgEngagementBrandedPost: toNumber(row.avgEngagementBrandedPost),
        avgInteractionBrandedPost: toNumber(row.avgInteractionBrandedPost),
        avgBuzzBrandedPost: toNumber(row.avgBuzzBrandedPost),
        positiveSentimentBrandedPost: toNumber(
          row.positiveSentimentBrandedPost
        ),

        unbrandedPostPerTotalPost: toNumber(row.unbrandedPostPerTotalPost),
        avgEngagementUnbrandedPost: toNumber(row.avgEngagementUnbrandedPost),
        avgInteractionUnbrandedPost: toNumber(row.avgInteractionUnbrandedPost),
        avgBuzzUnbrandedPost: toNumber(row.avgBuzzUnbrandedPost),
        positiveSentimentUnbrandedPost: toNumber(
          row.positiveSentimentUnbrandedPost
        ),

        videoPostPerTotalPost: toNumber(row.videoPostPerTotalPost),
        avgEngagementVideoPost: toNumber(row.avgEngagementVideoPost),
        avgInteractionVideoPost: toNumber(row.avgInteractionVideoPost),

        photoPostPerTotalPost: toNumber(row.photoPostPerTotalPost),
        avgEngagementPhotoPost: toNumber(row.avgEngagementPhotoPost),
        avgInteractionPhotoPost: toNumber(row.avgInteractionPhotoPost),

        top10BrandedPost: (row.top10BrandedPost),
        top10UnbrandedPost: (row.top10UnbrandedPost),
        bottom10BrandedPost: (row.bottom10BrandedPost),
        bottom10UnbrandedPost: (row.bottom10UnbrandedPost),

        clients: (row.clients),
        isBrand: toNumber(row.isBrand),
        workWithTPG: row.workWithTPG || null,
        PriceFrom: toNumber(row.PriceFrom),
        PriceTo: toNumber(row.PriceTo),

        isActive,
      };
    })
    .filter((doc) => doc.pageId);

  console.log(
    `📥 Prepared ${validRows.length} documents (${rows.length} total rows)`
  );

  for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
    const batch = validRows.slice(i, i + BATCH_SIZE);
    try {
      const res = await PageMeta.insertMany(batch, { ordered: false });
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

  console.log(`🎉 Import completed (${validRows.length} validRows).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
