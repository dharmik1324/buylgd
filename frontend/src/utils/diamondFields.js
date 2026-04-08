/**
 * diamondFields.js
 * ─────────────────────────────────────────────────────────────────
 * Global field-resolver for diamond objects.
 *
 * Different APIs and CSV uploads use different key names for the
 * same logical field (e.g. image could be "Diamond_Image",
 * "Stone_Img_url", "imageLink", "View Image", "Image", …).
 *
 * Use the helpers below everywhere in the UI instead of reading
 * raw keys like `item.Diamond_Image`. This guarantees the correct
 * value is found even when the backend normalisation pipeline
 * hasn't run (e.g. raw data passed through, CSV rows, etc.)
 * ─────────────────────────────────────────────────────────────────
 */

// ── Field alias maps ─────────────────────────────────────────────

/** All known keys that can carry the diamond image URL */
export const IMAGE_KEYS = [
  "Diamond_Image",
  "Stone_Img_url",
  "imageLink",
  "Image",
  "View Image",
  "img_url",
  "photo",
  "image_url",
  "img",
];

/** All known keys that can carry the video URL */
export const VIDEO_KEYS = [
  "Diamond_Video",
  "Video_url",
  "videoLink",
  "Video",
  "video_url",
  "Video Link",
  "view_video",
];

/** All known keys that can carry the certificate / report image URL */
export const CERTIFICATE_IMAGE_KEYS = [
  "Certificate_Image",
  "Certificate_file_url",
  "certiFile",
  "certi_file",
  "View Certi",
  "Certificate",
  "certi_url",
];

/** All known keys that can carry the certificate / report NUMBER */
export const CERTIFICATE_NO_KEYS = [
  "Certificate_No",
  "Lab_Report_No",
  "Lab Report No",
  "Report_No",
  "Report",
  "cert_no",
  "certificate_number",
];

/** All known keys that can carry the final total price */
export const PRICE_KEYS = [
  "Final_Price",
  "SaleAmt",
  "Price",
  "total_price",
  "finalPrice",
  "sale_amount",
];

/** All known keys that can carry the per-carat price */
export const PRICE_PER_CARAT_KEYS = [
  "Price_Per_Carat",
  "SaleRate",
  "Rate",
  "rate",
  "price_per_carat",
  "ppc",
];

/** All known keys that can carry the stock / stone number */
export const STOCK_NO_KEYS = [
  "Stock_No",
  "Stock_ID",
  "Stone_NO",
  "Stock",
  "stock_id",
  "stone_no",
  "Lot_ID",
];

/** All known keys for fluorescence */
export const FLUORESCENCE_KEYS = [
  "Fluorescence",
  "Fluo",
  "fluorescence",
  "Flour",
  "FluoName",
];

/** All known keys for measurements */
export const MEASUREMENTS_KEYS = [
  "Measurements",
  "Measurement",
  "measurement",
  "Size",
  "Dims",
];

// ── Core resolver ────────────────────────────────────────────────

/**
 * Resolves a value from a diamond object by checking a list of
 * possible key names in order, returning the first truthy value.
 *
 * @param {object} diamond   - raw diamond object from API / Redux
 * @param {string[]} keys    - ordered list of field aliases to try
 * @param {*} fallback       - value to return when nothing found
 */
export const resolveField = (diamond, keys, fallback = null) => {
  if (!diamond) return fallback;
  for (const key of keys) {
    const val = diamond[key];
    if (val !== undefined && val !== null && val !== "") {
      return val;
    }
  }
  return fallback;
};

// ── Convenience helpers ──────────────────────────────────────────

/** Diamond image URL (or null if not available) */
export const getDiamondImage       = (d) => resolveField(d, IMAGE_KEYS);

/** Diamond video URL (or null if not available) */
export const getDiamondVideo       = (d) => resolveField(d, VIDEO_KEYS);

/** Certificate image / PDF URL (or null) */
export const getCertificateImage   = (d) => resolveField(d, CERTIFICATE_IMAGE_KEYS);

/** Certificate / report number string (or null) */
export const getCertificateNo      = (d) => resolveField(d, CERTIFICATE_NO_KEYS);

/** Total price as a number (or 0) */
export const getFinalPrice         = (d) => Number(resolveField(d, PRICE_KEYS, 0)) || 0;

/** Per-carat price as a number (or 0) */
export const getPricePerCarat      = (d) => Number(resolveField(d, PRICE_PER_CARAT_KEYS, 0)) || 0;

/** Stock / lot number string (or null) */
export const getStockNo            = (d) => resolveField(d, STOCK_NO_KEYS);

/** Fluorescence string (or "NONE") */
export const getFluorescence       = (d) => resolveField(d, FLUORESCENCE_KEYS, "NONE");

/** Measurements string (or null) */
export const getMeasurements       = (d) => resolveField(d, MEASUREMENTS_KEYS);

/**
 * Returns a fully normalised, UI-ready object for a diamond.
 * Safe to destructure – every field has a defined fallback.
 */
export const normalizeDiamond = (d) => ({
  // Pass through raw object
  ...d,

  // Overwrite with resolved values
  Diamond_Image:      getDiamondImage(d),
  Diamond_Video:      getDiamondVideo(d),
  Certificate_Image:  getCertificateImage(d),
  Certificate_No:     getCertificateNo(d),
  Final_Price:        getFinalPrice(d),
  Price_Per_Carat:    getPricePerCarat(d),
  Stock_No:           getStockNo(d),
  Fluorescence:       getFluorescence(d),
  Measurements:       getMeasurements(d),

  // Basic fields with safe fallbacks
  Shape:        (d.Shape || d.SHAPE || "").toUpperCase() || "ROUND",
  Weight:       Number(d.Weight || d.weight || 0),
  Color:        d.Color || d.color || "",
  Clarity:      d.Clarity || d.clarity || "",
  Cut:          d.Cut || d.cut || "",
  Polish:       d.Polish || d.polish || "",
  Symmetry:     d.Symmetry || d.symmetry || "",
  Lab:          d.Lab || d.lab || "",
  Availability: d.Availability || d.StockStatus || d.status || "In Stock",
  Location:     d.Location || d.location || "",
  Depth:        d.Depth || d.depth || null,
  Table:        d.table_name || d.Table || d.table || null,
  Ratio:        d.Ratio || d.ratio || null,
  Bgm:          d.Bgm || d.bgm || "",
  Growth_Type:  d.Growth_Type || d.growth_type || d.GrowthType || "",
});
