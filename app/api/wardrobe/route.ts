import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { INITIAL_WARDROBE_ITEMS } from "../../../lib/data/initial-wardrobe";
import { WardrobeItem } from "../../../lib/types/wardrobe";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase();

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      let query = supabase.from("wardrobe_items").select("*").eq("archived", false);
      if (category && category !== "All") {
        query = query.eq("category", category);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return NextResponse.json({ items: data, source: "supabase" });
      }
    }

    // Fallback: filtered seed/memory items
    let filtered: WardrobeItem[] = [...INITIAL_WARDROBE_ITEMS];
    if (category && category !== "All") {
      filtered = filtered.filter(i => i.category === category);
    }
    if (search) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(search) ||
        i.colorName.toLowerCase().includes(search) ||
        i.subcategory.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ items: filtered, source: "local_memory" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
    }

    const newItem: WardrobeItem = {
      id: body.id || crypto.randomUUID(),
      userId: body.userId || "user_threads_demo",
      name: body.name,
      category: body.category,
      subcategory: body.subcategory || "Other",
      clothingType: body.clothingType || body.name,
      colorName: body.colorName || "Custom",
      dominantHex: body.dominantHex || "#4A4D48",
      secondaryColors: body.secondaryColors || [],
      attributes: body.attributes || { seasons: ["All-Season"], occasions: ["Casual"] },
      originalImagePath: body.originalImagePath || "",
      processedImagePath: body.processedImagePath,
      thumbnailPath: body.thumbnailPath,
      imageProcessingStatus: body.imageProcessingStatus || "original",
      aiAnalysisStatus: body.aiAnalysisStatus || "completed",
      aiConfidence: body.aiConfidence || 90,
      favorite: Boolean(body.favorite),
      wearCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from("wardrobe_items").insert(newItem).select().single();
      if (!error && data) {
        return NextResponse.json({ item: data, source: "supabase" }, { status: 201 });
      }
    }

    return NextResponse.json({ item: newItem, source: "local_memory" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create item" }, { status: 500 });
  }
}
