import fs from "fs";
import path from "path";

const CATALOG_PATH = path.join(process.cwd(), "src", "data", "catalog.json");

const BRANDS = {
  Zara: { tier: "fast", min: 20, max: 90, productUrl: "https://www.zara.com", slug: "zara" },
  "H&M": { tier: "fast", min: 15, max: 70, productUrl: "https://www2.hm.com", slug: "hm" },
  Uniqlo: { tier: "fast", min: 15, max: 60, productUrl: "https://www.uniqlo.com", slug: "uniqlo" },
  "Calvin Klein": {
    tier: "contemporary",
    min: 50,
    max: 160,
    productUrl: "https://www.calvinklein.us",
    slug: "ck",
  },
  Boss: { tier: "premium", min: 100, max: 350, productUrl: "https://www.hugoboss.com", slug: "boss" },
  Gucci: { tier: "luxury", min: 450, max: 2800, productUrl: "https://www.gucci.com", slug: "gucci" },
  "Saint Laurent": {
    tier: "luxury",
    min: 400,
    max: 2500,
    productUrl: "https://www.ysl.com",
    slug: "ysl",
  },
  "Louis Vuitton": {
    tier: "luxury",
    min: 600,
    max: 3500,
    productUrl: "https://www.louisvuitton.com",
    slug: "lv",
  },
};

const VIBE_ELIGIBLE_BRANDS = {
  comfy: ["Zara", "H&M", "Uniqlo", "Calvin Klein"],
  beach: ["Zara", "H&M", "Uniqlo", "Calvin Klein", "Boss"],
  party: ["Zara", "H&M", "Uniqlo", "Calvin Klein", "Boss", "Gucci", "Saint Laurent", "Louis Vuitton"],
};

const BRANDS_PER_ARCHETYPE = {
  comfy: 2,
  beach: 2,
  party: 3,
};

// 38 fixed archetypes, in the exact order given.
const ARCHETYPES = [
  // COMFY / top / male
  {
    vibe: "comfy",
    category: "top",
    gender: "male",
    title: "Oversized Hoodie",
    colors: ["Heather Grey", "Washed Black", "Olive"],
    styleDescriptor: "oversized cotton hoodie with kangaroo pocket and ribbed cuffs",
  },
  {
    vibe: "comfy",
    category: "top",
    gender: "male",
    title: "Boxy Crewneck Sweatshirt",
    colors: ["Black", "Stone", "Navy"],
    styleDescriptor: "boxy crewneck sweatshirt in heavyweight cotton fleece",
  },
  {
    vibe: "comfy",
    category: "top",
    gender: "male",
    title: "Waffle Henley Long-Sleeve",
    colors: ["Charcoal", "Cream", "Rust"],
    styleDescriptor: "waffle-knit henley with button placket and long sleeves",
  },
  {
    vibe: "comfy",
    category: "top",
    gender: "male",
    title: "Zip-Up Fleece Jacket",
    colors: ["Navy", "Grey", "Forest Green"],
    styleDescriptor: "zip-up fleece jacket with stand collar and side pockets",
  },
  // COMFY / top / female
  {
    vibe: "comfy",
    category: "top",
    gender: "female",
    title: "Cropped Knit Sweater",
    colors: ["Cream", "Blush Pink", "Sage"],
    styleDescriptor: "cropped knit sweater with ribbed hem and relaxed fit",
  },
  {
    vibe: "comfy",
    category: "top",
    gender: "female",
    title: "Oversized Boyfriend Cardigan",
    colors: ["Camel", "Grey", "Ivory"],
    styleDescriptor: "oversized boyfriend cardigan with dropped shoulders and patch pockets",
  },
  {
    vibe: "comfy",
    category: "top",
    gender: "female",
    title: "Ribbed Long-Sleeve Top",
    colors: ["Black", "Lilac", "White"],
    styleDescriptor: "ribbed long-sleeve top with a fitted, stretchy silhouette",
  },
  {
    vibe: "comfy",
    category: "top",
    gender: "female",
    title: "Fleece Quarter-Zip",
    colors: ["Taupe", "Navy", "Mauve"],
    styleDescriptor: "fleece quarter-zip pullover with a stand collar",
  },
  // COMFY / trouser / male
  {
    vibe: "comfy",
    category: "trouser",
    gender: "male",
    title: "Wide-Leg Fleece Sweatpant",
    colors: ["Charcoal", "Black", "Grey Marl"],
    styleDescriptor: "wide-leg fleece sweatpant with an elastic drawstring waist",
  },
  {
    vibe: "comfy",
    category: "trouser",
    gender: "male",
    title: "Relaxed Straight Jogger",
    colors: ["Stone", "Navy", "Black"],
    styleDescriptor: "relaxed straight-leg jogger with tapered ribbed cuffs",
  },
  {
    vibe: "comfy",
    category: "trouser",
    gender: "male",
    title: "Cargo Jogger",
    colors: ["Olive", "Khaki", "Black"],
    styleDescriptor: "cargo jogger with utility pockets and elastic cuffs",
  },
  // COMFY / trouser / female
  {
    vibe: "comfy",
    category: "trouser",
    gender: "female",
    title: "Relaxed Jogger Sweatpant",
    colors: ["Stone Beige", "Black", "Dusty Pink"],
    styleDescriptor: "relaxed jogger sweatpant with elastic cuffs and drawstring waist",
  },
  {
    vibe: "comfy",
    category: "trouser",
    gender: "female",
    title: "Wide-Leg Lounge Pant",
    colors: ["Cream", "Grey", "Taupe"],
    styleDescriptor: "wide-leg lounge pant in soft brushed fabric",
  },
  {
    vibe: "comfy",
    category: "trouser",
    gender: "female",
    title: "High-Waist Ribbed Legging",
    colors: ["Black", "Charcoal", "Wine"],
    styleDescriptor: "high-waist ribbed legging with a body-skimming fit",
  },

  // BEACH / top / male
  {
    vibe: "beach",
    category: "top",
    gender: "male",
    title: "Linen Camp-Collar Shirt",
    colors: ["Sand", "White", "Sky Blue"],
    styleDescriptor: "short-sleeve linen camp-collar shirt with a relaxed fit",
  },
  {
    vibe: "beach",
    category: "top",
    gender: "male",
    title: "Short-Sleeve Print Resort Shirt",
    colors: ["Tropical Print", "Navy Stripe", "Coral Print"],
    styleDescriptor: "short-sleeve resort shirt in a breezy printed weave",
  },
  {
    vibe: "beach",
    category: "top",
    gender: "male",
    title: "Terry Cloth Polo",
    colors: ["White", "Ocean Blue", "Sand"],
    styleDescriptor: "terry cloth polo with ribbed collar, breathable and absorbent",
  },
  // BEACH / top / female
  {
    vibe: "beach",
    category: "top",
    gender: "female",
    title: "Sleeveless Linen Tank",
    colors: ["Ivory", "Coral", "Sky Blue"],
    styleDescriptor: "sleeveless linen tank with a relaxed drape",
  },
  {
    vibe: "beach",
    category: "top",
    gender: "female",
    title: "Crochet Cover-Up Top",
    colors: ["White", "Natural", "Blush"],
    styleDescriptor: "open-stitch crochet cover-up top with a relaxed fit",
  },
  {
    vibe: "beach",
    category: "top",
    gender: "female",
    title: "Off-Shoulder Breezy Blouse",
    colors: ["Yellow", "White", "Turquoise"],
    styleDescriptor: "off-shoulder blouse in a lightweight, breezy fabric",
  },
  // BEACH / trouser / male
  {
    vibe: "beach",
    category: "trouser",
    gender: "male",
    title: "Drawstring Beach Short",
    colors: ["Ocean Blue", "Coral", "Sand"],
    styleDescriptor: "quick-dry drawstring beach short with mesh lining",
  },
  {
    vibe: "beach",
    category: "trouser",
    gender: "male",
    title: "Tailored Swim-to-Street Short",
    colors: ["Navy", "Stone", "Olive"],
    styleDescriptor: "tailored swim-to-street short in quick-dry fabric",
  },
  // BEACH / trouser / female
  {
    vibe: "beach",
    category: "trouser",
    gender: "female",
    title: "Wide-Leg Linen Trouser",
    colors: ["Sun Bleached Yellow", "White", "Sand"],
    styleDescriptor: "wide-leg linen trouser with an elastic waist",
  },
  {
    vibe: "beach",
    category: "trouser",
    gender: "female",
    title: "Flowy Palazzo Pant",
    colors: ["Coral", "Turquoise", "Ivory"],
    styleDescriptor: "flowy palazzo pant with a high waist and wide drape",
  },

  // PARTY / top / male
  {
    vibe: "party",
    category: "top",
    gender: "male",
    title: "Silk Button Shirt",
    colors: ["Midnight Navy", "Black", "Emerald"],
    styleDescriptor: "silk button-up shirt with a sheen finish",
  },
  {
    vibe: "party",
    category: "top",
    gender: "male",
    title: "Textured Jacquard Shirt",
    colors: ["Burgundy", "Black", "Gold"],
    styleDescriptor: "textured jacquard shirt with a subtle woven pattern",
  },
  {
    vibe: "party",
    category: "top",
    gender: "male",
    title: "Fine-Knit Turtleneck",
    colors: ["Black", "Charcoal", "Bottle Green"],
    styleDescriptor: "fine-knit turtleneck with a sleek, fitted silhouette",
  },
  {
    vibe: "party",
    category: "top",
    gender: "male",
    title: "Sequin Blazer",
    colors: ["Black Sequin", "Gold Sequin", "Silver Sequin"],
    styleDescriptor: "sequin-embellished blazer with structured shoulders",
  },
  // PARTY / top / female
  {
    vibe: "party",
    category: "top",
    gender: "female",
    title: "Sequin Statement Top",
    colors: ["Gunmetal Sequin", "Black Sequin", "Rose Gold Sequin"],
    styleDescriptor: "sequin-embellished statement top with a fitted silhouette",
  },
  {
    vibe: "party",
    category: "top",
    gender: "female",
    title: "Satin Cami Top",
    colors: ["Champagne", "Black", "Emerald"],
    styleDescriptor: "satin cami top with adjustable straps and a bias-cut drape",
  },
  {
    vibe: "party",
    category: "top",
    gender: "female",
    title: "Sheer Mesh Panel Top",
    colors: ["Black", "Nude", "Silver"],
    styleDescriptor: "sheer mesh panel top with strategic paneling",
  },
  {
    vibe: "party",
    category: "top",
    gender: "female",
    title: "Metallic Wrap Top",
    colors: ["Gold", "Silver", "Bronze"],
    styleDescriptor: "metallic wrap top with a draped, fitted silhouette",
  },
  // PARTY / trouser / male
  {
    vibe: "party",
    category: "trouser",
    gender: "male",
    title: "Tailored Dress Trouser",
    colors: ["Black", "Charcoal", "Navy"],
    styleDescriptor: "tailored dress trouser with a sharp straight-leg cut",
  },
  {
    vibe: "party",
    category: "trouser",
    gender: "male",
    title: "Slim Velvet Trouser",
    colors: ["Burgundy", "Black", "Emerald"],
    styleDescriptor: "slim velvet trouser with a rich, luxe texture",
  },
  {
    vibe: "party",
    category: "trouser",
    gender: "male",
    title: "Satin-Stripe Tux Trouser",
    colors: ["Black"],
    styleDescriptor: "tuxedo trouser with a satin side stripe",
  },
  // PARTY / trouser / female
  {
    vibe: "party",
    category: "trouser",
    gender: "female",
    title: "Slim Dress Pant",
    colors: ["Black", "Charcoal", "Ivory"],
    styleDescriptor: "slim dress pant with a tailored, knife-crease finish",
  },
  {
    vibe: "party",
    category: "trouser",
    gender: "female",
    title: "Satin Wide-Leg Trouser",
    colors: ["Champagne", "Black", "Emerald"],
    styleDescriptor: "satin wide-leg trouser with a fluid drape",
  },
  {
    vibe: "party",
    category: "trouser",
    gender: "female",
    title: "Sequin Flare Trouser",
    colors: ["Black Sequin", "Gold Sequin"],
    styleDescriptor: "sequin-embellished flare trouser with a subtle flare",
  },
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function randomPrice(min, max, tier) {
  const raw = min + Math.random() * (max - min);
  const base = Math.round(raw / 10) * 10;
  const clamped = Math.min(Math.max(base, min), max);
  return tier === "fast" ? Number((clamped - 0.1).toFixed(2)) : clamped;
}

const vibeCounters = { comfy: 0, beach: 0, party: 0 };

const catalog = [];

for (const archetype of ARCHETYPES) {
  const eligible = VIBE_ELIGIBLE_BRANDS[archetype.vibe];
  const brandCount = BRANDS_PER_ARCHETYPE[archetype.vibe];
  const startIndex = vibeCounters[archetype.vibe] % eligible.length;
  vibeCounters[archetype.vibe] += 1;

  const archetypeSlug = slugify(archetype.title);

  for (let k = 0; k < brandCount; k++) {
    const brandName = eligible[(startIndex + k) % eligible.length];
    const brandConfig = BRANDS[brandName];
    const color = archetype.colors[k % archetype.colors.length];
    const id = `${brandConfig.slug}-${archetypeSlug}`;

    catalog.push({
      id,
      brand: brandName,
      title: archetype.title,
      category: archetype.category,
      vibe: [archetype.vibe],
      gender: archetype.gender,
      price: randomPrice(brandConfig.min, brandConfig.max, brandConfig.tier),
      color,
      description: `${color} ${archetype.styleDescriptor}.`,
      productUrl: brandConfig.productUrl,
      imageUrl: `/catalog/${id}.png`,
    });
  }
}

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n");

console.log(`Wrote ${catalog.length} items to ${CATALOG_PATH}`);
const byBrand = {};
for (const item of catalog) {
  byBrand[item.brand] = (byBrand[item.brand] || 0) + 1;
}
console.log("Brand breakdown:", byBrand);
