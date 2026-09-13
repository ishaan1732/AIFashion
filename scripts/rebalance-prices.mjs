import fs from "fs";
import path from "path";

const CATALOG_PATH = path.join(process.cwd(), "src", "data", "catalog.json");

const BANDS = [
  { name: "Budget", min: 25, max: 72 },
  { name: "Mid", min: 76, max: 148 },
  { name: "Premium", min: 152, max: 248 },
  { name: "Statement", min: 255, max: 390 },
];

// [fracLow, fracHigh] of the assigned band's range that this brand's price should land in.
const BRAND_FRACTION = {
  Zara: [0.0, 0.4],
  "H&M": [0.0, 0.4],
  Uniqlo: [0.0, 0.4],
  "Calvin Klein": [0.35, 0.65],
  Boss: [0.55, 0.85],
  Gucci: [0.6, 1.0],
  "Saint Laurent": [0.6, 1.0],
  "Louis Vuitton": [0.6, 1.0],
};

const FAST_FASHION_BRANDS = new Set(["Zara", "H&M", "Uniqlo"]);

function roundPrice(raw, brand) {
  if (FAST_FASHION_BRANDS.has(brand)) {
    const base = Math.round(raw / 10) * 10;
    return Number((base - 0.1).toFixed(2));
  }
  return Math.round(raw / 5) * 5;
}

function bandOf(price) {
  for (const band of BANDS) {
    if (price >= band.min && price <= band.max) return band.name;
  }
  return price < BANDS[0].min ? "below-range" : "above-range";
}

function printDistribution(label, catalog) {
  const counts = {};
  for (const band of BANDS) counts[band.name] = 0;
  counts["below-range"] = 0;
  counts["above-range"] = 0;

  for (const item of catalog) {
    counts[bandOf(item.price)] += 1;
  }

  console.log(`\n${label} band distribution:`);
  for (const band of BANDS) {
    console.log(`  ${band.name.padEnd(10)} [${band.min}-${band.max}]: ${counts[band.name]}`);
  }
  if (counts["below-range"] || counts["above-range"]) {
    console.log(`  below-range: ${counts["below-range"]}, above-range: ${counts["above-range"]}`);
  }
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));

printDistribution("BEFORE", catalog);

// Group into 12 buckets: (gender, category, vibe[0])
const buckets = new Map();
for (const item of catalog) {
  const key = `${item.gender}|${item.category}|${item.vibe[0]}`;
  if (!buckets.has(key)) buckets.set(key, []);
  buckets.get(key).push(item);
}

for (const items of buckets.values()) {
  items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  items.forEach((item, i) => {
    const band = BANDS[i % 4];
    const [fracLow, fracHigh] = BRAND_FRACTION[item.brand];
    const range = band.max - band.min;
    const low = band.min + fracLow * range;
    const high = band.min + fracHigh * range;
    const raw = low + Math.random() * (high - low);

    let price = roundPrice(raw, item.brand);
    price = Math.min(BANDS[BANDS.length - 1].max, Math.max(BANDS[0].min, price));

    item.price = price;
  });
}

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n");

printDistribution("AFTER", catalog);

const prices = catalog.map((i) => i.price);
const min = Math.min(...prices);
const max = Math.max(...prices);
console.log(`\nOverall price range: $${min} - $${max}`);
console.log(
  max <= 390 && min >= 25
    ? "OK: all prices within [25, 390]."
    : "VIOLATION: a price fell outside [25, 390]!"
);
