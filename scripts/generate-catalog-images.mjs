import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const CATALOG_PATH = path.join(process.cwd(), "src", "data", "catalog.json");
const PUBLIC_DIR = path.join(process.cwd(), "public");

const MODELS = ["gemini-2.5-flash-image", "gemini-3.1-flash-image", "gemini-3-pro-image-preview"];

function buildPrompt(item) {
  const base = `Professional e-commerce studio product photograph of: ${item.description}.`;
  const subject =
    item.category === "trouser"
      ? "neatly flat-laid on a plain pure white seamless background"
      : "Ghost mannequin (invisible mannequin) front view, centered, plain pure white seamless background";
  return `${base} ${subject}, soft even studio lighting, no visible person, no face, no hands, no watermark, no text, no logo, high resolution, sharp focus, catalog-ready.`;
}

async function generateImage(ai, prompt) {
  for (const modelName of MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ text: prompt }],
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          return { data: part.inlineData.data, model: modelName };
        }
      }
    } catch (err) {
      console.warn(`  [warn] model ${modelName} failed: ${err.message}`);
    }
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in the environment.");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));

  fs.mkdirSync(path.join(PUBLIC_DIR, "catalog"), { recursive: true });

  const succeeded = [];
  const failed = [];

  for (const item of catalog) {
    const outPath = path.join(PUBLIC_DIR, item.imageUrl);

    if (fs.existsSync(outPath)) {
      console.log(`[skip] ${item.id} already exists`);
      continue;
    }

    const prompt = buildPrompt(item);
    console.log(`[gen]  ${item.id} — ${item.title}`);

    let result = await generateImage(ai, prompt);
    if (!result) {
      console.warn(`  [retry] ${item.id} failed once, retrying...`);
      result = await generateImage(ai, prompt);
    }

    if (result) {
      fs.writeFileSync(outPath, Buffer.from(result.data, "base64"));
      console.log(`  [ok]   ${item.id} -> ${item.imageUrl} (${result.model})`);
      succeeded.push(item.id);
    } else {
      console.error(`  [fail] ${item.id} — no model returned image data`);
      failed.push(item.id);
    }

    await sleep(1200);
  }

  console.log("\n=== Catalog image generation complete ===");
  console.log(`Succeeded: ${succeeded.length}`);
  console.log(`Failed:    ${failed.length}`);
  if (failed.length > 0) {
    console.log("Failed ids:", failed.join(", "));
  }
}

main();
