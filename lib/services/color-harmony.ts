import { ContrastPreference, PaletteDirection } from "../types/profile";

export interface ColorInfo {
  name: string;
  hex: string;
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
  isNeutral: boolean;
  temperature: "warm" | "cool" | "neutral";
}

// Named color registry with typical HSL ranges
export const COLOR_REGISTRY: Record<string, { hex: string; isNeutral: boolean; temperature: "warm" | "cool" | "neutral" }> = {
  "Black": { hex: "#1C1D1B", isNeutral: true, temperature: "neutral" },
  "Charcoal": { hex: "#3A3D3B", isNeutral: true, temperature: "neutral" },
  "Grey": { hex: "#7E8280", isNeutral: true, temperature: "neutral" },
  "Silver": { hex: "#B5B8B6", isNeutral: true, temperature: "neutral" },
  "White": { hex: "#FDFBF7", isNeutral: true, temperature: "neutral" },
  "Ivory": { hex: "#F5EFE1", isNeutral: true, temperature: "warm" },
  "Beige": { hex: "#D9C9B2", isNeutral: true, temperature: "warm" },
  "Sand": { hex: "#C7B393", isNeutral: true, temperature: "warm" },
  "Camel": { hex: "#B58450", isNeutral: false, temperature: "warm" },
  "Brown": { hex: "#63432C", isNeutral: true, temperature: "warm" },
  "Cognac": { hex: "#94552A", isNeutral: false, temperature: "warm" },
  "Navy": { hex: "#1E293B", isNeutral: true, temperature: "cool" },
  "Indigo": { hex: "#293754", isNeutral: false, temperature: "cool" },
  "Sky blue": { hex: "#7AAACE", isNeutral: false, temperature: "cool" },
  "Blue": { hex: "#2563EB", isNeutral: false, temperature: "cool" },
  "Olive": { hex: "#686D49", isNeutral: false, temperature: "warm" },
  "Forest green": { hex: "#244837", isNeutral: false, temperature: "cool" },
  "Sage": { hex: "#95A38F", isNeutral: false, temperature: "cool" },
  "Burgundy": { hex: "#6B1D2F", isNeutral: false, temperature: "cool" },
  "Wine": { hex: "#521A25", isNeutral: false, temperature: "cool" },
  "Rust": { hex: "#9E472A", isNeutral: false, temperature: "warm" },
  "Amber": { hex: "#C47D2B", isNeutral: false, temperature: "warm" },
  "Mustard": { hex: "#C99728", isNeutral: false, temperature: "warm" },
  "Terracotta": { hex: "#B85D43", isNeutral: false, temperature: "warm" },
  "Khaki": { hex: "#8A8462", isNeutral: true, temperature: "warm" },
  "Pink": { hex: "#E8A7B2", isNeutral: false, temperature: "cool" },
  "Lavender": { hex: "#B7A8D8", isNeutral: false, temperature: "cool" }
};

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "").trim();
  const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  const num = parseInt(full, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

export function parseColor(nameOrHex: string, fallbackHex = "#4A4D48"): ColorInfo {
  let hex = fallbackHex;
  let isNeutral = false;
  let temp: "warm" | "cool" | "neutral" = "neutral";

  if (COLOR_REGISTRY[nameOrHex]) {
    hex = COLOR_REGISTRY[nameOrHex].hex;
    isNeutral = COLOR_REGISTRY[nameOrHex].isNeutral;
    temp = COLOR_REGISTRY[nameOrHex].temperature;
  } else if (nameOrHex.startsWith("#")) {
    hex = nameOrHex;
  }

  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);

  if (s < 18 || l < 15 || l > 88) {
    isNeutral = true;
    temp = "neutral";
  } else if ((h >= 20 && h <= 160) || (h >= 340 && h <= 360)) {
    temp = "warm";
  } else {
    temp = "cool";
  }

  return { name: nameOrHex, hex, h, s, l, isNeutral, temperature: temp };
}

/**
 * Calculates harmony score between two colors (0 - 100)
 */
export function calculatePairHarmony(c1: ColorInfo, c2: ColorInfo): { score: number; relation: string } {
  // Rule 1: Two neutrals always harmonize cleanly in fashion (e.g. Navy + Sand, Charcoal + White)
  if (c1.isNeutral && c2.isNeutral) {
    const lDiff = Math.abs(c1.l - c2.l);
    if (lDiff > 25) {
      return { score: 96, relation: "High-contrast neutral pairing" };
    }
    return { score: 90, relation: "Tonal neutral pairing" };
  }

  // Rule 2: One neutral + one accent is the classic fashion grounding technique
  if (c1.isNeutral || c2.isNeutral) {
    return { score: 93, relation: "Neutral anchor with accent pop" };
  }

  // Both are chromatic accents: evaluate hue wheel relationship
  const hueDiff = Math.abs(c1.h - c2.h);
  const wheelDistance = Math.min(hueDiff, 360 - hueDiff);

  // Monochromatic: same hue family
  if (wheelDistance <= 25) {
    const lDiff = Math.abs(c1.l - c2.l);
    return { score: lDiff > 20 ? 94 : 85, relation: "Monochromatic tonal depth" };
  }

  // Analogous: neighboring colors on the wheel (e.g. Olive + Amber, Sky Blue + Forest)
  if (wheelDistance > 25 && wheelDistance <= 55) {
    return { score: 91, relation: "Analogous color coordination" };
  }

  // Complementary: across the wheel (150 - 210 deg, e.g. Blue + Rust, Navy + Ochre)
  if (wheelDistance >= 150 && wheelDistance <= 210) {
    return { score: 92, relation: "Striking complementary contrast" };
  }

  // Triadic: 110 - 130 deg
  if (wheelDistance >= 110 && wheelDistance <= 130) {
    return { score: 86, relation: "Vibrant triadic balance" };
  }

  // Shared color temperature (both warm or both cool)
  if (c1.temperature === c2.temperature) {
    return { score: 84, relation: `Harmonious ${c1.temperature} temperature palette` };
  }

  return { score: 72, relation: "Eclectic contrast" };
}

/**
 * Calculates overall harmony score for a full outfit (0 - 100)
 */
export function calculateOutfitColorHarmony(
  hexesOrNames: string[],
  palettePref: PaletteDirection = "Balanced neutrals",
  contrastPref: ContrastPreference = "Medium contrast"
): { score: number; explanation: string } {
  if (hexesOrNames.length <= 1) {
    return { score: 90, explanation: "Single focus piece." };
  }

  const colors = hexesOrNames.map(c => parseColor(c));
  let pairScoreSum = 0;
  let pairs = 0;
  const relations: string[] = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      const { score, relation } = calculatePairHarmony(colors[i], colors[j]);
      pairScoreSum += score;
      pairs++;
      if (!relations.includes(relation)) {
        relations.push(relation);
      }
    }
  }

  let avgScore = pairScoreSum / Math.max(pairs, 1);

  // Contrast check
  const lightnessValues = colors.map(c => c.l);
  const minL = Math.min(...lightnessValues);
  const maxL = Math.max(...lightnessValues);
  const contrastDelta = maxL - minL;

  if (contrastPref === "High contrast" && contrastDelta >= 45) {
    avgScore += 4;
  } else if (contrastPref === "Low contrast / Tonal" && contrastDelta <= 30) {
    avgScore += 4;
  }

  // Palette alignment
  const neutralCount = colors.filter(c => c.isNeutral).length;
  const warmCount = colors.filter(c => c.temperature === "warm").length;
  const coolCount = colors.filter(c => c.temperature === "cool").length;

  if (palettePref === "Warm neutrals" && (warmCount >= 2 || neutralCount >= 2)) {
    avgScore += 3;
  } else if (palettePref === "Cool tones" && coolCount >= 2) {
    avgScore += 3;
  } else if (palettePref === "Earthy tones" && warmCount >= 2) {
    avgScore += 3;
  }

  const finalScore = Math.min(99, Math.max(60, Math.round(avgScore)));
  const explanation = relations.slice(0, 2).join(" with ");

  return { score: finalScore, explanation };
}
