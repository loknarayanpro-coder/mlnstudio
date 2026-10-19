import { MainCategory, Occasion, Season, WardrobeItem } from "./wardrobe";

export type OutfitFeedbackType = "love" | "save" | "not_for_me" | "swap_item" | "worn";

export type RejectionReason =
  | "Color combination"
  | "Style"
  | "Occasion"
  | "Fit preference"
  | "Too formal"
  | "Too casual"
  | "Repeated outfit"
  | "Weather mismatch"
  | "Other";

export interface OutfitScoreBreakdown {
  colorHarmony: number; // 0 - 100
  occasionFit: number;  // 0 - 100
  weatherFit: number;   // 0 - 100
  styleFit: number;     // 0 - 100
  varietyBonus: number; // -20 to +10
  totalScore: number;   // 0 - 100
}

export interface OutfitRecommendation {
  id: string;
  title: string;
  vibe: string;
  occasion: Occasion;
  season?: Season;
  items: WardrobeItem[];
  missingSlots?: string[];
  score: OutfitScoreBreakdown;
  explanation: string;
  stylingTip?: string;
  weatherNote?: string;
}

export interface SavedOutfit {
  id: string;
  userId: string;
  name: string;
  occasion: Occasion;
  itemIds: string[];
  styleTags: string[];
  notes?: string;
  wearCount: number;
  lastWornAt?: string;
  scheduledForDate?: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

export interface OutfitFeedbackEvent {
  id: string;
  userId: string;
  outfitId?: string;
  recommendedItemIds: string[];
  feedbackType: OutfitFeedbackType;
  reason?: RejectionReason;
  notes?: string;
  createdAt: string;
}
