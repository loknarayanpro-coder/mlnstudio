import { NextResponse } from "next/server";
import { analyzeGarmentImage } from "../../../../lib/services/ai-vision";

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType, hint, clientFeatures } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    const { result, provider } = await analyzeGarmentImage(
      imageBase64,
      mimeType || "image/jpeg",
      hint,
      clientFeatures
    );

    return NextResponse.json({
      success: true,
      analysis: result,
      provider,
      analyzedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Analysis failed" }, { status: 500 });
  }
}
