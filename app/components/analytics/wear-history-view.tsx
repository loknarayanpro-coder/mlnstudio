"use client";

import React from "react";
import { Footprints, TrendingUp, AlertCircle, ArrowUpRight, Sparkles } from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";
import { GarmentIllustration } from "../ui/garment-illustration";

export function WearHistoryView({ onSelectPiece }: { onSelectPiece: (piece: any) => void }) {
  const { items, markItemWorn, setActiveTab } = useWardrobe();

  const totalWears = items.reduce((acc, i) => acc + (i.wearCount || 0), 0);
  const activePieces = items.filter(i => (i.wearCount || 0) > 0);
  const utilizationRate = Math.round((activePieces.length / Math.max(items.length, 1)) * 100);

  // Sorted by most worn
  const mostWorn = [...items].sort((a, b) => b.wearCount - a.wearCount).slice(0, 5);

  // Underutilized pieces (worn 0 or 1 time)
  const underutilized = items.filter(i => (i.wearCount || 0) <= 1).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <div className="eyebrow text-[#585c6e]">CLOSET ROTATION &bull; COUTURE ARCHIVE METRICS</div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">Wear History & Analytics</h1>
        <p className="mt-1 font-editorial italic text-sm text-[#484c5c]">
          Track which silhouettes define your signature look and rediscover unworn garments in your archive.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#585c6e]">
            <span className="eyebrow text-[#585c6e]">TOTAL WEARS</span>
            <Footprints size={16} />
          </div>
          <div className="mt-4 font-gothic text-3xl font-bold text-[#090a10]">{totalWears}</div>
          <div className="mt-1 font-editorial italic text-xs text-[#585c6e]">Across all archive pieces</div>
        </div>

        <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#585c6e]">
            <span className="eyebrow text-[#585c6e]">UTILIZATION</span>
            <TrendingUp size={16} />
          </div>
          <div className="mt-4 font-gothic text-3xl font-bold text-[#090a10]">{utilizationRate}%</div>
          <div className="mt-1 font-editorial italic text-xs text-[#585c6e]">Garments worn at least once</div>
        </div>

        <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#585c6e]">
            <span className="eyebrow text-[#585c6e]">HERO PIECES</span>
            <Sparkles size={16} />
          </div>
          <div className="mt-4 font-gothic text-3xl font-bold text-[#090a10]">
            {items.filter(i => i.wearCount >= 10).length}
          </div>
          <div className="mt-1 font-editorial italic text-xs text-[#585c6e]">Worn 10+ times</div>
        </div>

        <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#585c6e]">
            <span className="eyebrow text-[#585c6e]">UNWORN PIECES</span>
            <AlertCircle size={16} />
          </div>
          <div className="mt-4 font-gothic text-3xl font-bold text-[#090a10]">
            {items.filter(i => i.wearCount === 0).length}
          </div>
          <div className="mt-1 font-editorial italic text-xs text-[#585c6e]">Ready for debut</div>
        </div>
      </div>

      {/* Hero vs Underutilized Two-Column View */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Worn */}
        <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#bcc0ce]/50 pb-3">
            <div>
              <div className="eyebrow text-[#585c6e]">SIGNATURE ROTATION</div>
              <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#090a10]">Most Worn Pieces</h2>
            </div>
          </div>

          <div className="mt-4 divide-y divide-[#bcc0ce]/40">
            {mostWorn.map(piece => (
              <div
                key={piece.id}
                className="flex items-center justify-between py-3 transition hover:bg-[#f4f6fa] rounded-xl px-2"
              >
                <div
                  className="flex cursor-pointer items-center gap-3"
                  onClick={() => onSelectPiece(piece)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-[#e8ecf4] to-[#d8dbe6] border border-[#bcc0ce]">
                    <GarmentIllustration item={piece} />
                  </div>
                  <div>
                    <div className="font-gothic text-xs font-bold uppercase tracking-wide text-[#090a10]">{piece.name}</div>
                    <div className="font-editorial italic text-[11px] text-[#585c6e]">{piece.category} &bull; {piece.colorName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#0a0b10] px-3 py-1 font-gothic text-[10px] font-bold tracking-wider text-white">
                    {piece.wearCount} wears
                  </span>
                  <button
                    onClick={() => markItemWorn(piece.id)}
                    title="Mark worn today"
                    className="rounded-full border border-[#bcc0ce] bg-white p-1.5 text-[#585c6e] hover:bg-[#0a0b10] hover:text-white transition shadow-2xs"
                  >
                    <Footprints size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rediscover Pieces */}
        <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#bcc0ce]/50 pb-3">
            <div>
              <div className="eyebrow text-[#585c6e]">UNDERUTILIZED</div>
              <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#090a10]">Rediscover in Archive</h2>
            </div>
            <button
              onClick={() => setActiveTab("AI stylist")}
              className="font-gothic text-xs font-bold uppercase tracking-wider text-[#0a0b10] hover:underline"
            >
              Style these ↗
            </button>
          </div>

          <div className="mt-4 divide-y divide-[#bcc0ce]/40">
            {underutilized.map(piece => (
              <div
                key={piece.id}
                className="flex items-center justify-between py-3 transition hover:bg-[#f4f6fa] rounded-xl px-2"
              >
                <div
                  className="flex cursor-pointer items-center gap-3"
                  onClick={() => onSelectPiece(piece)}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-[#e8ecf4] to-[#d8dbe6] border border-[#bcc0ce]">
                    <GarmentIllustration item={piece} />
                  </div>
                  <div>
                    <div className="font-gothic text-xs font-bold uppercase tracking-wide text-[#090a10]">{piece.name}</div>
                    <div className="font-editorial italic text-[11px] text-[#585c6e]">{piece.category} &bull; {piece.colorName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-editorial italic text-xs text-[#585c6e]">
                    {piece.wearCount === 0 ? "Never worn" : "Worn once"}
                  </span>
                  <button
                    onClick={() => markItemWorn(piece.id)}
                    title="Mark worn today"
                    className="rounded-full border border-[#bcc0ce] bg-white px-3 py-1 font-gothic text-[11px] font-bold uppercase tracking-wider text-[#0a0b10] hover:bg-[#0a0b10] hover:text-white transition shadow-2xs"
                  >
                    + Wear
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
