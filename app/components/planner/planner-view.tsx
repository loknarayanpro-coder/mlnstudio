"use client";

import React, { useState } from "react";
import {
  CalendarDays, Plus, Check, Footprints, Trash2, ArrowUpRight, Sparkles, X
} from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";
import { GarmentIllustration } from "../ui/garment-illustration";

const DAYS = [
  { key: "Monday", label: "Monday", date: "Oct 19" },
  { key: "Tuesday", label: "Tuesday", date: "Oct 20" },
  { key: "Wednesday", label: "Wednesday", date: "Oct 21" },
  { key: "Thursday", label: "Thursday", date: "Oct 22" },
  { key: "Friday", label: "Friday", date: "Oct 23" },
  { key: "Saturday", label: "Saturday", date: "Oct 24" },
  { key: "Sunday", label: "Sunday", date: "Oct 25" }
];

export function PlannerView() {
  const { savedOutfits, recommendations, items, saveOutfit, markOutfitWorn, setActiveTab } = useWardrobe();
  const [scheduledMap, setScheduledMap] = useState<Record<string, string>>({
    Monday: savedOutfits[0]?.id || "",
    Wednesday: savedOutfits[1]?.id || ""
  });
  const [modalDay, setModalDay] = useState<string | null>(null);

  const handleAssignOutfit = (day: string, outfitId: string) => {
    setScheduledMap(curr => ({ ...curr, [day]: outfitId }));
    setModalDay(null);
  };

  const handleRemoveScheduled = (day: string) => {
    setScheduledMap(curr => {
      const copy = { ...curr };
      delete copy[day];
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow text-[#585c6e]">WEEKLY ROTATION &bull; ATELIER SCHEDULE</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">Outfit Planner</h1>
          <p className="mt-1 font-editorial italic text-sm text-[#484c5c]">
            Plan your silhouettes ahead of time to ensure balanced rotation across your luxury wardrobe.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("AI stylist")}
          className="gothic-enamel-btn flex items-center gap-2"
        >
          <Sparkles size={14} />
          <span>Generate with AI Stylist</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DAYS.map(day => {
          const outfitId = scheduledMap[day.key];
          const outfit = savedOutfits.find(o => o.id === outfitId) || (recommendations[0] && outfitId === recommendations[0].id ? recommendations[0] : null);
          const outfitItems = outfit
            ? "itemIds" in outfit
              ? outfit.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean)
              : outfit.items
            : [];

          return (
            <div
              key={day.key}
              className="flex flex-col overflow-hidden rounded-[24px] border border-[#bcc0ce] bg-white/95 p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between border-b border-[#bcc0ce]/60 pb-3">
                <div>
                  <div className="font-gothic font-bold uppercase tracking-wider text-[#0a0b10] text-sm">{day.label}</div>
                  <div className="text-[11px] font-gothic text-[#585c6e] tracking-wider">{day.date}</div>
                </div>
                <CalendarDays size={16} className="text-[#585c6e]" />
              </div>

              {outfit && outfitItems.length > 0 ? (
                <div className="mt-4 flex flex-1 flex-col">
                  {/* Miniature board */}
                  <div className="flex h-32 items-center justify-center gap-1 rounded-xl bg-gradient-to-b from-[#e8ecf4] via-[#dfe3ed] to-[#d2d6e2] p-2 border border-[#bcc0ce]">
                    {outfitItems.slice(0, 3).map((piece: any) => (
                      <div key={piece.id} className="flex h-24 flex-1 items-center justify-center rounded-lg bg-white/80 border border-[#bcc0ce]/60 shadow-2xs">
                        <GarmentIllustration item={piece} />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 font-gothic font-bold text-xs uppercase tracking-wide text-[#0a0b10] truncate">
                    {"name" in outfit ? outfit.name : outfit.title}
                  </div>
                  <div className="text-[10.5px] font-editorial italic text-[#585c6e]">
                    {"occasion" in outfit ? outfit.occasion : "Everyday"}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#bcc0ce]/50">
                    <button
                      onClick={() => markOutfitWorn(outfit.id)}
                      className="flex items-center gap-1 rounded-full border border-[#bcc0ce] bg-white px-2.5 py-1 text-[11px] font-gothic font-bold uppercase tracking-wider text-[#0a0b10] hover:bg-[#0a0b10] hover:text-white transition shadow-2xs"
                    >
                      <Footprints size={12} /> Worn
                    </button>
                    <button
                      onClick={() => handleRemoveScheduled(day.key)}
                      className="text-[11px] font-gothic font-bold tracking-wider text-[#585c6e] hover:text-rose-600 transition uppercase"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-[#f4f6fa] border border-[#bcc0ce] p-3 text-[#585c6e]">
                    <Plus size={18} />
                  </div>
                  <p className="mt-3 font-editorial italic text-xs text-[#585c6e]">No look scheduled</p>
                  <button
                    onClick={() => setModalDay(day.key)}
                    className="mt-4 rounded-full border border-[#bcc0ce] bg-white px-4 py-1.5 font-gothic text-xs font-bold uppercase tracking-wider text-[#0a0b10] shadow-2xs hover:bg-[#0a0b10] hover:text-white transition"
                  >
                    Select look
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Outfit Selection Modal */}
      {modalDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setModalDay(null);
          }}
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[24px] bg-[#0d0e15] border border-white/10 text-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <div className="eyebrow text-[#85899b]">SCHEDULE FOR {modalDay.toUpperCase()}</div>
                <h3 className="mt-1 text-lg font-gothic font-bold uppercase tracking-wider text-white">Choose an outfit</h3>
              </div>
              <button
                onClick={() => setModalDay(null)}
                aria-label="Close"
                className="rounded-full border border-white/15 bg-[#161722] p-1.5 text-[#9094a6] hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="eyebrow text-[#85899b]">SAVED LOOKS</div>
              {savedOutfits.map(o => (
                <button
                  key={o.id}
                  onClick={() => handleAssignOutfit(modalDay, o.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-[#161826] p-3 text-left transition hover:border-white"
                >
                  <div>
                    <div className="text-sm font-gothic font-bold text-white uppercase tracking-wide">{o.name}</div>
                    <div className="text-xs text-[#8e92a4] font-editorial italic">{o.occasion} &bull; {o.itemIds.length} pieces</div>
                  </div>
                  <span className="text-xs font-gothic font-bold text-white">Select ↗</span>
                </button>
              ))}

              <div className="mt-4 eyebrow text-[#85899b]">AI STYLIST RECOMMENDATIONS</div>
              {recommendations.slice(0, 3).map(rec => (
                <button
                  key={rec.id}
                  onClick={() => {
                    saveOutfit({
                      name: rec.title,
                      occasion: rec.occasion,
                      itemIds: rec.items.map(i => i.id)
                    });
                    handleAssignOutfit(modalDay, rec.id);
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/15 bg-[#161826] p-3 text-left transition hover:border-white"
                >
                  <div>
                    <div className="text-sm font-gothic font-bold text-white uppercase tracking-wide">{rec.title}</div>
                    <div className="text-xs text-[#8e92a4] font-editorial italic">{rec.vibe} &bull; {rec.score.totalScore}% match</div>
                  </div>
                  <span className="text-xs font-gothic font-bold text-white">Save & Pick ↗</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
