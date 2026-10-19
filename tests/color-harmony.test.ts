import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  rgbToHsl,
  parseColor,
  calculatePairHarmony,
  calculateOutfitColorHarmony
} from "../lib/services/color-harmony";

describe("Color Harmony & Conversion Service", () => {
  it("converts hex to RGB correctly", () => {
    expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#8BB9D8")).toEqual({ r: 139, g: 185, b: 216 });
  });

  it("converts RGB to HSL correctly", () => {
    const white = rgbToHsl(255, 255, 255);
    expect(white.l).toBe(100);

    const black = rgbToHsl(0, 0, 0);
    expect(black.l).toBe(0);

    const red = rgbToHsl(255, 0, 0);
    expect(red.h).toBe(0);
    expect(red.s).toBe(100);
    expect(red.l).toBe(50);
  });

  it("identifies neutrals accurately", () => {
    const white = parseColor("#FFFFFF");
    expect(white.isNeutral).toBe(true);

    const black = parseColor("#1C1D1B");
    expect(black.isNeutral).toBe(true);

    const charcoal = parseColor("Charcoal");
    expect(charcoal.isNeutral).toBe(true);

    const navy = parseColor("Navy");
    expect(navy.isNeutral).toBe(true);

    const skyBlue = parseColor("Sky blue");
    expect(skyBlue.isNeutral).toBe(false);
  });

  it("scores neutral pairings with high harmony", () => {
    const navy = parseColor("Navy");
    const sand = parseColor("Sand");
    const { score, relation } = calculatePairHarmony(navy, sand);

    expect(score).toBeGreaterThanOrEqual(90);
    expect(relation).toContain("neutral pairing");
  });

  it("scores complementary colors with contrast bonus", () => {
    const blue = parseColor("#2563EB");
    const rust = parseColor("#9E472A");
    const { score, relation } = calculatePairHarmony(blue, rust);

    expect(score).toBeGreaterThanOrEqual(85);
  });

  it("calculates overall outfit color harmony and returns sensible scores", () => {
    const items = ["#8BB9D8", "#C7B393", "#FDFBF7", "#B5B8B6"];
    const result = calculateOutfitColorHarmony(items, "Balanced neutrals", "Medium contrast");

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.explanation.length).toBeGreaterThan(5);
  });
});
