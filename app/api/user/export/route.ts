import { NextResponse } from "next/server";
import { INITIAL_WARDROBE_ITEMS, DEFAULT_USER_PROFILE } from "../../../../lib/data/initial-wardrobe";

export async function GET() {
  try {
    const exportData = {
      exportDate: new Date().toISOString(),
      formatVersion: "1.0",
      product: "THREADS — AI Digital Wardrobe",
      profile: DEFAULT_USER_PROFILE,
      wardrobe: INITIAL_WARDROBE_ITEMS,
      note: "All wardrobe item metadata, detected colors, and preferences are exported in standard JSON format."
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="threads-wardrobe-export.json"'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
