import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  processClothingStudioImage,
  CLOTHING_STUDIO_PROMPT
} from "../lib/services/gemini-studio";
import { validateClothingImage } from "../lib/services/image-processing";

describe("Gemini Clothing Studio Image Processing", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("contains all critical garment fidelity and photographic quality instructions in the prompt", () => {
    expect(CLOTHING_STUDIO_PROMPT).toContain("## THREADS — PREMIUM AI FASHION STUDIO");
    expect(CLOTHING_STUDIO_PROMPT).toContain("photorealistic luxury e-commerce studio photograph of the EXACT SAME garment");
    expect(CLOTHING_STUDIO_PROMPT).toContain("GARMENT ACCURACY — NON-NEGOTIABLE");
    expect(CLOTHING_STUDIO_PROMPT).toContain("PREMIUM STUDIO PRESENTATION");
    expect(CLOTHING_STUDIO_PROMPT).toContain("CATEGORY-AWARE EDITING");
    expect(CLOTHING_STUDIO_PROMPT).toContain("QUALITY CONTROL");
    expect(CLOTHING_STUDIO_PROMPT).toContain("FINAL STANDARD");
  });

  it("processes image in studio catalog fallback mode when GEMINI_API_KEY is unset", async () => {
    delete process.env.GEMINI_API_KEY;
    const testBase64 = "data:image/jpeg;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    const result = await processClothingStudioImage({
      imageBase64: testBase64,
      mimeType: "image/jpeg",
      category: "Tops",
      preferredBackground: "warm white"
    });

    expect(result.success).toBe(true);
    expect(result.provider).toBe("studio_catalog_fallback");
    expect(result.processedImageUrl).toBe(testBase64);
    expect(result.fidelityNote).toContain("100% original garment fidelity preserved");
    expect(result.message).toContain("Studio Catalog Presentation");
  });

  it("gracefully falls back without throwing when Gemini API returns an error or invalid key", async () => {
    process.env.GEMINI_API_KEY = "dummy_invalid_api_key";
    const testBase64 = "data:image/jpeg;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    const result = await processClothingStudioImage({
      imageBase64: testBase64,
      mimeType: "image/jpeg",
      category: "Outerwear"
    });

    // Should not crash, should return graceful fallback
    expect(result.success).toBe(true);
    expect(result.processedImageUrl).toBe(testBase64);
    expect(result.provider).toBe("studio_catalog_fallback");
  });

  it("validates file sizes and formats for studio uploads", () => {
    // Normal JPEG / PNG / WebP should be valid
    expect(validateClothingImage({ type: "image/jpeg", size: 500_000 }).valid).toBe(true);
    expect(validateClothingImage({ type: "image/png", size: 1_200_000 }).valid).toBe(true);
    expect(validateClothingImage({ type: "image/webp", size: 300_000 }).valid).toBe(true);

    // Oversized files (> 10MB) must be rejected
    const oversized = validateClothingImage({ type: "image/jpeg", size: 15 * 1024 * 1024 });
    expect(oversized.valid).toBe(false);
    expect(oversized.error).toContain("too large");

    // Invalid mime type
    const invalidFormat = validateClothingImage({ type: "image/tiff", size: 100_000 });
    expect(invalidFormat.valid).toBe(false);
  });
});
