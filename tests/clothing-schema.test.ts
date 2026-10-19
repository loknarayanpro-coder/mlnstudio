import { describe, it, expect } from "vitest";
import { clothingAnalysisSchema } from "../lib/services/ai-vision";
import { validateClothingImage } from "../lib/services/image-processing";

describe("Clothing Schema & Upload Validation", () => {
  it("validates valid clothing attribute payload", () => {
    const valid = {
      category: "Tops",
      subcategory: "Shirt",
      clothingType: "Oxford button-down shirt",
      mainColor: "Sky blue",
      dominantHex: "#8BB9D8",
      secondaryColors: ["#FFFFFF"],
      pattern: "Solid",
      likelyMaterial: "100% Cotton",
      fit: "Tailored",
      sleeveLength: "Long",
      neckline: "Button-Down",
      seasons: ["Spring", "Autumn", "All-Season"],
      occasions: ["Smart casual", "Office"],
      styleTags: ["Classic", "Preppy"],
      confidence: 94,
      explanation: "Classic tailored Oxford weave shirt in clean sky blue."
    };

    const parsed = clothingAnalysisSchema.parse(valid);
    expect(parsed.category).toBe("Tops");
    expect(parsed.confidence).toBe(94);
  });

  it("rejects invalid category in schema", () => {
    const invalid = {
      category: "Spacesuits", // Invalid
      subcategory: "Helmet",
      clothingType: "Pressure suit",
      mainColor: "White",
      dominantHex: "#FFFFFF",
      confidence: 90,
      explanation: "N/A"
    };

    expect(() => clothingAnalysisSchema.parse(invalid)).toThrow();
  });

  it("rejects invalid hex code format in schema", () => {
    const invalid = {
      category: "Tops",
      subcategory: "T-Shirt",
      clothingType: "Tee",
      mainColor: "Blue",
      dominantHex: "not-a-hex", // Invalid
      confidence: 85,
      explanation: "Test"
    };

    expect(() => clothingAnalysisSchema.parse(invalid)).toThrow();
  });

  it("validates supported clothing image mime types", () => {
    expect(validateClothingImage({ type: "image/jpeg", size: 1024 * 1024 }).valid).toBe(true);
    expect(validateClothingImage({ type: "image/png", size: 2 * 1024 * 1024 }).valid).toBe(true);
    expect(validateClothingImage({ type: "image/webp", size: 500 * 1024 }).valid).toBe(true);

    // Unsupported
    expect(validateClothingImage({ type: "application/pdf", size: 1024 }).valid).toBe(false);
    expect(validateClothingImage({ type: "image/gif", size: 1024 }).valid).toBe(false);

    // File too large (> 10MB)
    expect(validateClothingImage({ type: "image/jpeg", size: 12 * 1024 * 1024 }).valid).toBe(false);
  });
});
