import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { fullCatalog, filterCatalog, getFallbackRecommendations } from "@/lib/catalog";
import { UserPreferences, StylistRecommendation, RecommendationResponse } from "@/types/fashion";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, preferences } = (await req.json()) as {
      imageBase64?: string;
      preferences: UserPreferences;
    };

    if (!preferences) {
      return NextResponse.json({ error: "Preferences are required" }, { status: 400 });
    }

    // 1. Get candidate items from our catalog based on brand, category, vibe, and budget
    let candidates = filterCatalog(preferences);
    if (candidates.length < 3) {
      candidates = fullCatalog.filter((item) => {
        const catMatch = preferences.category === "full-look" || item.category === preferences.category;
        return catMatch;
      });
    }

    const ai = getGeminiClient();

    // If Gemini client is active and we have an image
    if (ai) {
      try {
        const promptText = `
You are an elite haute-couture and runway stylist at New York and Paris Fashion Week.
A client has submitted their photo and styling preferences:
- Budget Target: $${preferences.budget} USD
- Desired Category: ${preferences.category}
- Desired Fashion Sense / Occasion: ${preferences.vibe}
- Fashion Houses Filter: ${preferences.preferredBrands.join(", ")}

Here is the current fashion inventory available from Zara, Calvin Klein, and Hugo Boss:
${JSON.stringify(candidates, null, 2)}

Your task:
1. Inspect the person's photo (their posture, lighting, skin undertone, and aesthetic aura). If no clear person is visible, analyze their requested vibe directly.
2. Select the BEST 3 to 5 items from the provided inventory that best match their budget, desired category (${preferences.category}), and vibe (${preferences.vibe}).
3. For each selected item, assign a matchScore (integer 85-99), a compelling stylistReason explaining why it flatters their silhouette/coloring and fits their occasion, and an actionable stylingTip (shoes, accessories, layering).
4. Provide a 2-sentence vibeAnalysis describing the user's fashion aura.
5. Provide a 1-sentence overallStylistSummary.

Return ONLY a JSON object strictly following this JSON schema:
{
  "vibeAnalysis": "string",
  "overallStylistSummary": "string",
  "recommendedItemIds": [
    {
      "id": "item id matching the inventory id",
      "matchScore": 95,
      "stylistReason": "reason string",
      "stylingTip": "tip string"
    }
  ]
}
`;

        const parts: any[] = [];

        // If user submitted an image
        if (imageBase64 && imageBase64.includes(",")) {
          const [header, base64Data] = imageBase64.split(",");
          const mimeMatch = header.match(/data:([^;]+);base64/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";

          parts.push({
            inlineData: {
              data: base64Data,
              mimeType,
            },
          });
        }

        parts.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: parts,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const rawText = response.text || "";
        const parsed = JSON.parse(rawText);

        if (parsed && Array.isArray(parsed.recommendedItemIds)) {
          const recommendations: StylistRecommendation[] = [];

          for (const rec of parsed.recommendedItemIds) {
            const foundItem = fullCatalog.find((item) => item.id === rec.id);
            if (foundItem) {
              recommendations.push({
                item: foundItem,
                matchScore: rec.matchScore || 92,
                stylistReason: rec.stylistReason || "Expertly curated for your silhouette.",
                stylingTip: rec.stylingTip || "Pair with tonal accessories for elevated contrast.",
              });
            }
          }

          if (recommendations.length > 0) {
            const output: RecommendationResponse = {
              vibeAnalysis: parsed.vibeAnalysis || "Contemporary and confident silhouette with an effortless modern aesthetic.",
              overallStylistSummary: parsed.overallStylistSummary || "Curated top matches blending luxury tailoring and seasonal ease.",
              recommendations,
            };
            return NextResponse.json(output);
          }
        }
      } catch (geminiError: any) {
        console.warn("Gemini API call failed, using intelligent catalog fallback:", geminiError.message);
      }
    }

    // Intelligent Fallback (Ensures the app always works smoothly even without API keys or on quota limits)
    const fallbackItems = getFallbackRecommendations(preferences);
    const fallbackRecs: StylistRecommendation[] = fallbackItems.map((item, idx) => {
      const scores = [96, 94, 91, 89, 87];
      const reasons: Record<string, string> = {
        Zara: "Brings directional runway trends at sharp value, providing an edgy silhouette that accentuates your posture.",
        "Calvin Klein": "Iconic 90s minimalism that highlights clean geometry and monochromatic elegance.",
        Boss: "Precision European tailoring with luxury fabric drape, conveying quiet authority and refined taste.",
      };

      return {
        item,
        matchScore: scores[idx % scores.length],
        stylistReason: `${reasons[item.brand]} Specially chosen for your ${preferences.vibe} brief and $${preferences.budget} budget.`,
        stylingTip: `Pair with ${item.color.toLowerCase().includes("black") || item.color.toLowerCase().includes("navy") ? "minimalist silver jewelry and clean loafers" : "warm leather accents and sunglasses"}.`,
      };
    });

    const fallbackResponse: RecommendationResponse = {
      vibeAnalysis: `A chic, poised presence with natural affinity for ${preferences.vibe} aesthetics. Clean proportions well-suited for structured and fluid draping.`,
      overallStylistSummary: `Curated ${fallbackRecs.length} premier selections across Zara, Calvin Klein, and Hugo Boss calibrated to your $${preferences.budget} target.`,
      recommendations: fallbackRecs,
    };

    return NextResponse.json(fallbackResponse);
  } catch (error: any) {
    console.error("Stylist API Error:", error);
    return NextResponse.json({ error: error.message || "Styling error" }, { status: 500 });
  }
}
