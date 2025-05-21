export const normalizePhoneVN = (phone) => {
  let p = phone.toString().trim();
  if (p.startsWith("+84")) p = "0" + p.slice(3);
  else if (p.startsWith("84")) p = "0" + p.slice(2);
  p = p.replace(/\D/g, "");
  const map = {
    // Viettel
    "0162": "032",
    "0163": "033",
    "0164": "034",
    "0165": "035",
    "0166": "036",
    "0167": "037",
    "0168": "038",
    "0169": "039",
    // VinaPhone & MobiFone
    "0120": "070",
    "0121": "079",
    "0122": "077",
    "0126": "076",
    "0128": "078",
    "0123": "083",
    "0124": "084",
    "0125": "085",
    "0127": "081",
    "0129": "082",
    // Vietnamobile
    "0186": "056",
    "0188": "058",
    // Gmobile
    "0199": "059",
  };
  for (const [oldPrefix, newPrefix] of Object.entries(map)) {
    if (p.startsWith(oldPrefix)) {
      p = p.replace(oldPrefix, newPrefix);
      break;
    }
  }
  return /^0[3-9][0-9]{8}$/.test(p) ? p : null;
};
