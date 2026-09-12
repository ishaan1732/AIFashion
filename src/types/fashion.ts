export type Brand =
  | "Zara"
  | "H&M"
  | "Uniqlo"
  | "Calvin Klein"
  | "Boss"
  | "Gucci"
  | "Saint Laurent"
  | "Louis Vuitton";

export type Category = "top" | "trouser" | "outerwear" | "full-look";

export type FashionVibe = "comfy" | "beach" | "party" | "formal";

export type BudgetTier = "budget" | "mid" | "luxury";

export interface CatalogItem {
  id: string;
  brand: Brand;
  title: string;
  category: Category;
  vibe: FashionVibe[];
  gender: "male" | "female";
  price: number;
  imageUrl: string;
  productUrl: string;
  color: string;
  description: string;
  matchHighlights?: string[];
}

export interface UserPreferences {
  budget: number; // Maximum budget or target
  category: Category;
  vibe: FashionVibe;
  preferredBrands: Brand[];
}

export interface StylistRecommendation {
  item: CatalogItem;
  matchScore: number; // 0-100
  stylistReason: string;
  stylingTip: string;
  tryOnPrompt?: string;
  colorHarmonization?: string;
}

export interface RecommendationResponse {
  vibeAnalysis: string;
  recommendations: StylistRecommendation[];
  overallStylistSummary: string;
}
