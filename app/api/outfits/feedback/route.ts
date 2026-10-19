import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { outfitId, recommendedItemIds, feedbackType, reason, notes } = await request.json();

    if (!feedbackType) {
      return NextResponse.json({ error: "feedbackType is required" }, { status: 400 });
    }

    const event = {
      id: crypto.randomUUID(),
      userId: "user_threads_demo",
      outfitId,
      recommendedItemIds: recommendedItemIds || [],
      feedbackType,
      reason,
      notes,
      createdAt: new Date().toISOString()
    };

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase.from("outfit_feedback").insert({
        id: event.id,
        user_id: event.userId,
        outfit_id: event.outfitId,
        recommended_item_ids: event.recommendedItemIds,
        feedback_type: event.feedbackType,
        reason: event.reason,
        notes: event.notes
      });
    }

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record feedback" }, { status: 500 });
  }
}
