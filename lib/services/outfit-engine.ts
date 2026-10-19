import { MainCategory, Occasion, Season, WardrobeItem } from "../types/wardrobe";
import { OutfitRecommendation, OutfitScoreBreakdown, SavedOutfit, OutfitFeedbackEvent } from "../types/outfit";
import { UserProfile } from "../types/profile";
import { WeatherCondition } from "../types/weather";
import { calculateOutfitColorHarmony } from "./color-harmony";

export interface OutfitGenerationOptions {
  occasion?: Occasion;
  season?: Season;
  weather?: WeatherCondition | null;
  anchorItemId?: string; // Build outfit around a specific item
  profile?: Partial<UserProfile>;
  feedbackHistory?: OutfitFeedbackEvent[];
  savedOutfits?: SavedOutfit[];
  maxCandidates?: number;
}

// Formality mapping for items
export function getItemFormalityLevel(item: WardrobeItem): number {
  // 1 (very casual) to 5 (black-tie formal)
  const cat = item.category;
  const sub = item.subcategory;
  const name = item.name.toLowerCase();

  if (cat === "Dresses & One-Pieces") {
    if (name.includes("evening") || name.includes("silk") || sub === "Traditional") return 5;
    return 3;
  }
  if (sub === "T-Shirt" || sub === "Hoodie" || sub === "Shorts" || sub === "Sandals") return 1;
  if (sub === "Jeans" || sub === "Sneakers") return 2;
  if (sub === "Polo" || sub === "Chinos" || sub === "Sweater" || sub === "Loafers") return 3;
  if (sub === "Shirt" || sub === "Trousers" || sub === "Jacket" || sub === "Coat" || sub === "Formal Shoes") return 4;
  return 3;
}

export function getOccasionTargetFormality(occasion: Occasion): number {
  switch (occasion) {
    case "Casual":
    case "Everyday":
    case "Weekend":
      return 2;
    case "Smart casual":
    case "Date night":
    case "Travel":
      return 3;
    case "Office":
      return 4;
    case "Formal":
    case "Wedding guest":
    case "Festive":
      return 5;
    default:
      return 3;
  }
}

/**
 * Validates hard constraints for outfit completeness & sanity
 */
export function validateOutfitComposition(items: WardrobeItem[]): { valid: boolean; missingSlots: string[] } {
  const hasDress = items.some(i => i.category === "Dresses & One-Pieces");
  const hasTop = items.some(i => i.category === "Tops");
  const hasBottom = items.some(i => i.category === "Bottoms");
  const hasFootwear = items.some(i => i.category === "Footwear");

  const missing: string[] = [];

  if (!hasDress) {
    if (!hasTop) missing.push("Top");
    if (!hasBottom) missing.push("Bottom");
  }
  // If no dress and no footwear, flag missing footwear
  if (!hasFootwear && !hasDress) missing.push("Footwear");

  const valid = hasDress || (hasTop && hasBottom);
  return { valid, missingSlots: missing };
}

/**
 * Calculates score for a candidate item set
 */
export function scoreOutfitCandidate(
  items: WardrobeItem[],
  options: OutfitGenerationOptions
): { breakdown: OutfitScoreBreakdown; explanation: string; stylingTip: string } {
  const occasion = options.occasion || "Everyday";
  const targetFormality = getOccasionTargetFormality(occasion);

  // 1. Color Harmony
  const colors = items.map(i => i.dominantHex || i.colorName);
  const colorResult = calculateOutfitColorHarmony(
    colors,
    options.profile?.paletteDirection || "Balanced neutrals",
    options.profile?.preferredContrast || "Medium contrast"
  );
  let colorScore = colorResult.score;

  // Favorite / Disliked Color bonus/penalty
  const favColors = options.profile?.favoriteColors || [];
  const disColors = options.profile?.dislikedColors || [];
  for (const item of items) {
    if (favColors.some(fc => item.colorName.toLowerCase().includes(fc.toLowerCase()))) {
      colorScore = Math.min(100, colorScore + 2);
    }
    if (disColors.some(dc => item.colorName.toLowerCase().includes(dc.toLowerCase()))) {
      colorScore = Math.max(40, colorScore - 10);
    }
  }

  // 2. Occasion & Formality Fit
  const formalities = items.map(getItemFormalityLevel);
  const avgFormality = formalities.reduce((a, b) => a + b, 0) / Math.max(formalities.length, 1);
  const formalityDiff = Math.abs(avgFormality - targetFormality);
  const occasionScore = Math.max(50, Math.round(100 - formalityDiff * 14));

  // 3. Weather Fit (Weather penalty removed - user requested direct access to all dresses and combos without climate restrictions)
  const weatherScore = 96;
  const weatherTip = "";

  // 4. Style Profile Fit
  let styleScore = 88;
  const stylePrefs = options.profile?.stylePreferences || [];
  if (stylePrefs.length > 0) {
    const matched = items.some(i =>
      i.attributes.occasions?.includes(occasion) ||
      (i.attributes.brand && stylePrefs.includes(i.attributes.brand))
    );
    if (matched) styleScore = 94;
  }

  // 5. Wear History & Variety Adjustment
  let varietyBonus = 5;
  const recentWornCount = items.filter(i => {
    if (!i.lastWornAt) return false;
    const daysSince = (Date.now() - new Date(i.lastWornAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince < 3;
  }).length;

  if (recentWornCount > 0) {
    varietyBonus = -8 * recentWornCount; // avoid repeating recently worn pieces
  }

  // Feedback history learning
  if (options.feedbackHistory && options.feedbackHistory.length > 0) {
    const itemIds = new Set(items.map(i => i.id));
    for (const fb of options.feedbackHistory) {
      const overlap = fb.recommendedItemIds.filter(id => itemIds.has(id)).length;
      if (overlap >= 2) {
        if (fb.feedbackType === "love" || fb.feedbackType === "save") {
          varietyBonus += 4;
        } else if (fb.feedbackType === "not_for_me") {
          varietyBonus -= 8;
        }
      }
    }
  }

  const total = Math.min(
    99,
    Math.max(50, Math.round(colorScore * 0.35 + occasionScore * 0.30 + weatherScore * 0.20 + styleScore * 0.15 + varietyBonus))
  );

  const breakdown: OutfitScoreBreakdown = {
    colorHarmony: colorScore,
    occasionFit: occasionScore,
    weatherFit: weatherScore,
    styleFit: styleScore,
    varietyBonus,
    totalScore: total
  };

  const explanation = `${colorResult.explanation}. Tailored for ${occasion.toLowerCase()} with a balanced ${avgFormality >= 3.5 ? "elevated" : "relaxed"} silhouette.`;
  const stylingTip = weatherTip || `Roll the cuffs slightly or add an intentional watch to refine the proportions.`;

  return { breakdown, explanation, stylingTip };
}

/**
 * Generate candidate outfits from available wardrobe items
 */
export function generateOutfitRecommendations(
  wardrobe: WardrobeItem[],
  options: OutfitGenerationOptions = {}
): OutfitRecommendation[] {
  const activeItems = wardrobe.filter(i => !i.archived);
  const tops = activeItems.filter(i => i.category === "Tops");
  const bottoms = activeItems.filter(i => i.category === "Bottoms");
  const dresses = activeItems.filter(i => i.category === "Dresses & One-Pieces");
  const shoes = activeItems.filter(i => i.category === "Footwear");
  const outerwear = activeItems.filter(i => i.category === "Outerwear");
  const watches = activeItems.filter(i => i.category === "Watches");
  const accessories = activeItems.filter(i => i.category === "Accessories" || i.category === "Bags");

  const candidates: Array<{ items: WardrobeItem[]; title: string; vibe: string }> = [];

  // Anchor item requirement
  let filterTops = tops;
  let filterBottoms = bottoms;
  let filterDresses = dresses;

  if (options.anchorItemId) {
    const anchor = activeItems.find(i => i.id === options.anchorItemId);
    if (anchor) {
      if (anchor.category === "Tops") filterTops = [anchor];
      else if (anchor.category === "Bottoms") filterBottoms = [anchor];
      else if (anchor.category === "Dresses & One-Pieces") filterDresses = [anchor];
    }
  }

  // Permutation generator (Tops + Bottoms)
  for (const t of filterTops) {
    for (const b of filterBottoms) {
      const outfitPieces: WardrobeItem[] = [t, b];
      // Pick best footwear
      const pairShoes = shoes.find(s => {
        const fDiff = Math.abs(getItemFormalityLevel(s) - getItemFormalityLevel(t));
        return fDiff <= 1;
      }) || shoes[0];

      if (pairShoes) outfitPieces.push(pairShoes);

      // Deterministic Outerwear for cold weather or elevated occasions
      if (outerwear.length > 0 && (options.weather?.isCold || options.occasion === "Formal" || options.occasion === "Office")) {
        const layer = outerwear[0];
        if (!outfitPieces.includes(layer)) outfitPieces.push(layer);
      }

      // Deterministic Accessories
      if (watches.length > 0 && (getItemFormalityLevel(t) >= 3 || options.occasion === "Office" || options.occasion === "Formal")) {
        outfitPieces.push(watches[0]);
      }

      let vibe = "SMART CASUAL";
      if (t.subcategory === "T-Shirt" && b.subcategory === "Jeans") vibe = "OFF-DUTY WEEKEND";
      else if (t.subcategory === "Shirt" && b.subcategory === "Trousers") vibe = "MODERN OFFICE";
      else if (b.subcategory === "Shorts") vibe = "WARM WEATHER CASUAL";

      candidates.push({
        items: outfitPieces,
        title: `${t.name} with ${b.name}`,
        vibe
      });
    }
  }

  // Permutations for Dresses & One-Pieces (combos with layers, shoes, accessories)
  for (const d of filterDresses) {
    // Combo 1: Solo Silhouette (Clean drape & statement cut)
    const soloPieces: WardrobeItem[] = [d];
    if (shoes.length > 0) soloPieces.push(shoes[0]);
    if (accessories.length > 0) soloPieces.push(accessories[0]);

    candidates.push({
      items: soloPieces,
      title: `${d.name} • Solo Silhouette`,
      vibe: "HAUTE MINIMALIST"
    });

    // Combo 2: Evening / Gala Styling (Luxe elevated perspective)
    const eveningPieces: WardrobeItem[] = [d];
    if (shoes.length > 0) eveningPieces.push(shoes.length > 1 ? shoes[1] : shoes[0]);
    if (watches.length > 0) eveningPieces.push(watches[0]);
    else if (accessories.length > 1) eveningPieces.push(accessories[1]);

    candidates.push({
      items: eveningPieces,
      title: `${d.name} • Evening Gala Styling`,
      vibe: "NOIR COUTURE"
    });

    // Combo 3: Daywear / Modern Editorial Perspective
    const dayPieces: WardrobeItem[] = [d];
    const bagItem = activeItems.find(i => i.category === "Bags");
    if (bagItem) dayPieces.push(bagItem);
    else if (accessories.length > 0 && !dayPieces.includes(accessories[0])) dayPieces.push(accessories[0]);

    candidates.push({
      items: dayPieces,
      title: `${d.name} • Modern Atelier Look`,
      vibe: "MODERN ATELIER"
    });

    // Combo 4: Layered Sartorial Combos (Pairing dress with jackets, coats, or blazers)
    for (const layer of outerwear) {
      const layeredPieces: WardrobeItem[] = [d, layer];
      if (shoes.length > 0) {
        const shoeMatch = shoes.length > 1 ? shoes[1] : shoes[0];
        layeredPieces.push(shoeMatch);
      }
      if (watches.length > 0) layeredPieces.push(watches[0]);

      candidates.push({
        items: layeredPieces,
        title: `${d.name} layered with ${layer.name}`,
        vibe: "CHIC ARCHITECTURAL"
      });
    }

    // Combo 5: Curated Luxe Ensemble (Dress + Shoes + Bag/Watch)
    if (bagItem && shoes.length > 0) {
      const fullLuxe: WardrobeItem[] = [d, shoes[0], bagItem];
      if (watches.length > 0) fullLuxe.push(watches[0]);

      candidates.push({
        items: fullLuxe,
        title: `${d.name} • Curated Luxe Ensemble`,
        vibe: "ELEVATED MONOCHROME"
      });
    }

    // Combo 6: Alternative Footwear Look (e.g. boots vs sandals vs sneakers)
    if (shoes.length > 1) {
      const altShoe = shoes[shoes.length - 1];
      candidates.push({
        items: [d, altShoe],
        title: `${d.name} with ${altShoe.name}`,
        vibe: "EFFORTLESS MODERN"
      });
    }
  }

  // In case wardrobe is sparse (missing tops/bottoms), create valid partial candidate and report missing slots
  if (candidates.length === 0 && activeItems.length > 0) {
    const sample = activeItems.slice(0, Math.min(3, activeItems.length));
    candidates.push({
      items: sample,
      title: "Capsule Essentials Look",
      vibe: "IN-PROGRESS WARDROBE"
    });
  }

  // Score all candidates
  const scored = candidates.map(c => {
    const { valid, missingSlots } = validateOutfitComposition(c.items);
    const { breakdown, explanation, stylingTip } = scoreOutfitCandidate(c.items, options);

    return {
      id: `rec-${c.items.map(i => i.id).join("-")}-${c.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${options.occasion || "everyday"}`,
      title: c.title,
      vibe: c.vibe,
      occasion: options.occasion || "Everyday",
      season: options.season,
      items: c.items,
      missingSlots: valid ? undefined : missingSlots,
      score: breakdown,
      explanation,
      stylingTip,
      weatherNote: options.weather ? `${options.weather.description}, ${options.weather.temperatureC}°C` : undefined
    };
  });

  // Sort descending by total score
  scored.sort((a, b) => b.score.totalScore - a.score.totalScore);

  const limit = options.maxCandidates || 16;
  return scored.slice(0, limit);
}
