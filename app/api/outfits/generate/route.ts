import { NextResponse } from "next/server";
import { generateOutfitRecommendations } from "../../../../lib/services/outfit-engine";
import { WardrobeItem } from "../../../../lib/types/wardrobe";

export async function POST(request: Request) {
  try {
    const { items, options } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "A list of wardrobe items is required" }, { status: 400 });
    }

    const recommendations = generateOutfitRecommendations(items as WardrobeItem[], options || {});

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
      generatedAt: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Outfit generation failed" }, { status: 500 });
  }
}
