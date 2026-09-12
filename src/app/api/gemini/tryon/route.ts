import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getGeminiClient } from "@/lib/gemini";
import { fullCatalog } from "@/lib/catalog";

async function urlToBase64(url: string): Promise<{ data: string; mimeType: string } | null> {
  try {
    if (url.startsWith("/")) {
      const buffer = fs.readFileSync(path.join(process.cwd(), "public", url));
      return {
        data: buffer.toString("base64"),
        mimeType: "image/png",
      };
    }

    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = res.headers.get("content-type") || "image/jpeg";
    return {
      data: buffer.toString("base64"),
      mimeType,
    };
  } catch (e) {
    console.warn("Could not convert image url to base64:", e);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userImageBase64, catalogItemId } = await req.json();

    if (!userImageBase64 || !catalogItemId) {
      return NextResponse.json(
        { error: "userImageBase64 and catalogItemId are required" },
        { status: 400 }
      );
    }

    const item = fullCatalog.find((i) => i.id === catalogItemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found in catalog" }, { status: 404 });
    }

    // Check for API key from header, env, or query
    const apiKeyFromHeader = req.headers.get("x-gemini-api-key");
    const ai = getGeminiClient(apiKeyFromHeader || undefined);

    console.log(`[Try-on] Processing item ${item.brand} ${item.title}. Gemini AI Client active: ${!!ai}`);

    let virtualImageUrl: string | null = null;
    let stylistComment = `The ${item.brand} ${item.title} fits your proportions with a clean, contemporary drape in ${item.color}.`;
    let isAiGenerated = false;

    // If Gemini client is active with an API key
    if (ai) {
      try {
        const parts: any[] = [];

        // 1. Add user photo
        let userBase64Clean = userImageBase64;
        let userMime = "image/jpeg";
        if (userImageBase64.includes(",")) {
          const [header, data] = userImageBase64.split(",");
          userBase64Clean = data;
          const mimeMatch = header.match(/data:([^;]+);base64/);
          if (mimeMatch) userMime = mimeMatch[1];
        }

        parts.push({
          inlineData: {
            data: userBase64Clean,
            mimeType: userMime,
          },
        });

        // 2. Add garment photo
        const garmentImage = await urlToBase64(item.imageUrl);
        if (garmentImage) {
          parts.push({
            inlineData: garmentImage,
          });
        }

        // 3. Virtual Try-On Prompt
        const promptText = `
You are a high-fashion AI virtual try-on engine for a runway showcase.
Image 1: The user.
Image 2: An authentic clothing item from ${item.brand} titled "${item.title}" in ${item.color} (${item.category}, ${item.description}).

Your task:
Photorealistically fuse this exact garment onto the user from Image 1.
1. Render the person wearing this new ${item.brand} outfit.
2. Keep the person's face, skin tone, hair, body proportions, and pose completely identical.
3. Replace their upper/lower clothing with this garment, ensuring realistic fabric folds, shadows, and natural draping.
4. Output the generated photorealistic try-on image and provide 1 sentence of fashion stylist feedback.
`;
        parts.push({ text: promptText });

        // Try Gemini image models in order
        const modelsToTry = [
          "gemini-2.5-flash-image",
          "gemini-3.1-flash-image",
          "gemini-3-pro-image-preview",
        ];

        for (const modelName of modelsToTry) {
          try {
            console.log(`[Try-on] Calling Gemini model: ${modelName}...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: parts,
            });

            if (response.candidates && response.candidates[0]?.content?.parts) {
              for (const part of response.candidates[0].content.parts) {
                if ((part as any).inlineData?.data) {
                  virtualImageUrl = `data:image/png;base64,${(part as any).inlineData.data}`;
                  isAiGenerated = true;
                  console.log(`[Try-on] Successfully generated virtual try-on image with ${modelName}!`);
                  break;
                }
                if (part.text && !stylistComment) {
                  stylistComment = part.text.slice(0, 180);
                }
              }
            }

            if (virtualImageUrl) break;
          } catch (modelErr: any) {
            console.warn(`[Try-on] Model ${modelName} returned:`, modelErr.message);
          }
        }
      } catch (geminiError: any) {
        console.warn("[Try-on] Gemini try-on exception:", geminiError.message);
      }
    }

    return NextResponse.json({
      success: true,
      item,
      virtualImageUrl,
      isAiGenerated,
      hasApiKey: !!ai,
      stylistComment,
    });
  } catch (error: any) {
    console.error("Virtual try-on error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate virtual try-on" },
      { status: 500 }
    );
  }
}
