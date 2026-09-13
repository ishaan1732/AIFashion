import catalogData from "@/data/catalog.json";
import { CatalogItem, UserPreferences } from "@/types/fashion";

export const fullCatalog: CatalogItem[] = catalogData as CatalogItem[];

export interface SearchFilters {
  category: "top" | "trouser";
  vibe: "comfy" | "beach" | "party";
  budgetTier: "under-75" | "75-150" | "150-250" | "above-250";
  gender: "male" | "female";
}

export function searchCatalog(filters: SearchFilters): CatalogItem[] {
  const { category, vibe, budgetTier, gender } = filters;

  let maxBudget = 9999;
  let minBudget = 0;
  if (budgetTier === "under-75") {
    maxBudget = 75;
  } else if (budgetTier === "75-150") {
    minBudget = 70;
    maxBudget = 160;
  } else if (budgetTier === "150-250") {
    minBudget = 140;
    maxBudget = 260;
  } else {
    minBudget = 220;
    maxBudget = 9999;
  }

  const exact = fullCatalog.filter(
    (item) =>
      item.gender === gender &&
      item.category === category &&
      item.vibe.includes(vibe) &&
      item.price >= minBudget &&
      item.price <= maxBudget
  );

  // Fallbacks widen the budget window to ±50% of the tier's own range rather than
  // dropping the price constraint entirely — only the final gender-only fallback does that.
  const widenedMinBudget = minBudget * 0.5;
  const widenedMaxBudget = maxBudget >= 9999 ? 9999 : maxBudget * 1.5;

  const genderCategoryVibe = fullCatalog.filter(
    (item) =>
      item.gender === gender &&
      item.category === category &&
      item.vibe.includes(vibe) &&
      item.price >= widenedMinBudget &&
      item.price <= widenedMaxBudget
  );

  const genderCategoryOnly = fullCatalog.filter(
    (item) =>
      item.gender === gender &&
      item.category === category &&
      item.price >= widenedMinBudget &&
      item.price <= widenedMaxBudget
  );

  const genderOnly = fullCatalog.filter((item) => item.gender === gender);

  const combined: CatalogItem[] = [];
  const addedIds = new Set<string>();

  const addItems = (list: CatalogItem[]) => {
    for (const item of list) {
      if (!addedIds.has(item.id)) {
        addedIds.add(item.id);
        combined.push(item);
      }
    }
  };

  addItems(exact);
  addItems(genderCategoryVibe);
  addItems(genderCategoryOnly);
  addItems(genderOnly);

  return combined.slice(0, 6);
}

export function filterCatalog(preferences: UserPreferences): CatalogItem[] {
  return fullCatalog.filter((item) => {
    if (preferences.preferredBrands?.length > 0 && !preferences.preferredBrands.includes(item.brand)) {
      return false;
    }
    if (preferences.category !== "full-look" && item.category !== preferences.category) {
      return false;
    }
    return item.vibe.includes(preferences.vibe) || item.price <= preferences.budget * 1.25;
  });
}

export function getFallbackRecommendations(preferences: UserPreferences): CatalogItem[] {
  let matched = fullCatalog.filter((item) => {
    const catMatch = preferences.category === "full-look" || item.category === preferences.category;
    const vibeMatch = item.vibe.includes(preferences.vibe);
    return catMatch && vibeMatch;
  });

  if (matched.length === 0) {
    matched = fullCatalog.filter((item) => item.category === preferences.category);
  }

  return matched
    .sort((a, b) => Math.abs(a.price - preferences.budget) - Math.abs(b.price - preferences.budget))
    .slice(0, 5);
}
