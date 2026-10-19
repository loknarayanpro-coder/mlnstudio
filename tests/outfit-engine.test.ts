import { describe, it, expect } from "vitest";
import {
  validateOutfitComposition,
  getItemFormalityLevel,
  getOccasionTargetFormality,
  generateOutfitRecommendations,
  scoreOutfitCandidate
} from "../lib/services/outfit-engine";
import { SAMPLE_WARDROBE_ITEMS } from "../lib/data/initial-wardrobe";
import { WardrobeItem } from "../lib/types/wardrobe";

describe("Deterministic Outfit Recommendation Engine", () => {
  it("validates outfit completeness (Top + Bottom OR Dress)", () => {
    const top = SAMPLE_WARDROBE_ITEMS.find(i => i.category === "Tops")!;
    const bottom = SAMPLE_WARDROBE_ITEMS.find(i => i.category === "Bottoms")!;
    const dress = SAMPLE_WARDROBE_ITEMS.find(i => i.category === "Dresses & One-Pieces")!;

    // Incomplete: Top only
    const res1 = validateOutfitComposition([top]);
    expect(res1.valid).toBe(false);
    expect(res1.missingSlots).toContain("Bottom");

    // Complete: Top + Bottom
    const res2 = validateOutfitComposition([top, bottom]);
    expect(res2.valid).toBe(true);

    // Complete: Dress only
    const res3 = validateOutfitComposition([dress]);
    expect(res3.valid).toBe(true);
  });

  it("calculates formality mapping consistently", () => {
    const tee = SAMPLE_WARDROBE_ITEMS.find(i => i.subcategory === "T-Shirt")!;
    const trousers = SAMPLE_WARDROBE_ITEMS.find(i => i.subcategory === "Trousers")!;

    expect(getItemFormalityLevel(tee)).toBeLessThan(getItemFormalityLevel(trousers));
    expect(getOccasionTargetFormality("Casual")).toBe(2);
    expect(getOccasionTargetFormality("Formal")).toBe(5);
  });

  it("generates ranked candidates using real items from closet", () => {
    const candidates = generateOutfitRecommendations(SAMPLE_WARDROBE_ITEMS, {
      occasion: "Smart casual"
    });

    expect(candidates.length).toBeGreaterThan(0);
    // Highest score first
    for (let i = 0; i < candidates.length - 1; i++) {
      expect(candidates[i].score.totalScore).toBeGreaterThanOrEqual(candidates[i + 1].score.totalScore);
    }

    // Verify all items in the candidate exist in wardrobe
    const allIds = new Set(SAMPLE_WARDROBE_ITEMS.map(i => i.id));
    for (const cand of candidates) {
      for (const piece of cand.items) {
        expect(allIds.has(piece.id)).toBe(true);
      }
    }
  });

  it("applies penalty for recently worn items to encourage rotation", () => {
    const top = SAMPLE_WARDROBE_ITEMS.find(i => i.category === "Tops")!;
    const bottom = SAMPLE_WARDROBE_ITEMS.find(i => i.category === "Bottoms")!;

    const freshTop = { ...top, lastWornAt: undefined };
    const wornTop = { ...top, lastWornAt: new Date().toISOString() };

    const scoreFresh = scoreOutfitCandidate([freshTop, bottom], { occasion: "Casual" });
    const scoreWorn = scoreOutfitCandidate([wornTop, bottom], { occasion: "Casual" });

    expect(scoreFresh.breakdown.varietyBonus).toBeGreaterThan(scoreWorn.breakdown.varietyBonus);
  });

  it("learns from feedback history", () => {
    const top = SAMPLE_WARDROBE_ITEMS.find(i => i.category === "Tops")!;
    const bottom = SAMPLE_WARDROBE_ITEMS.find(i => i.category === "Bottoms")!;

    const lovedFeedback = [
      {
        id: "fb-1",
        userId: "test-user",
        recommendedItemIds: [top.id, bottom.id],
        feedbackType: "love" as const,
        createdAt: new Date().toISOString()
      }
    ];

    const scoreNeutral = scoreOutfitCandidate([top, bottom], { occasion: "Casual" });
    const scoreLoved = scoreOutfitCandidate([top, bottom], {
      occasion: "Casual",
      feedbackHistory: lovedFeedback
    });

    expect(scoreLoved.breakdown.varietyBonus).toBeGreaterThan(scoreNeutral.breakdown.varietyBonus);
  });

  it("handles empty wardrobe with 0 items safely", () => {
    const candidates = generateOutfitRecommendations([], { occasion: "Casual" });
    expect(candidates).toEqual([]);
  });
});
