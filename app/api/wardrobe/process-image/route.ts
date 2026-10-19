import { NextResponse } from "next/server";
import { validateClothingImage } from "../../../../lib/services/image-processing";
import { processClothingStudioImage } from "../../../../lib/services/gemini-studio";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType, sizeBytes, category, preferredBackground } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    // Validate size and file type
    const validation = validateClothingImage({
      type: mimeType || "image/jpeg",
      size: sizeBytes || Math.round((imageBase64.length * 3) / 4)
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Run Gemini Studio image processing
    const result = await processClothingStudioImage({
      imageBase64,
      mimeType: mimeType || "image/jpeg",
      category,
      preferredBackground
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Studio processing route error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process clothing studio image",
        provider: "studio_catalog_fallback"
      },
      { status: 500 }
    );
  }
}
