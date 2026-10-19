"use client";

import React from "react";
import { Heart, Trash2, Footprints, Copy, Calendar, Sparkles } from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";
import { GarmentIllustration } from "../ui/garment-illustration";

export function SavedOutfitsView() {
  const { savedOutfits, items, deleteSavedOutfit, markOutfitWorn, saveOutfit, setActiveTab } = useWardrobe();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow text-[#585c6e]">CURATED LOOKBOOK &bull; ARCHIVE REPERTORY</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">Saved Outfits</h1>
          <p className="mt-1 font-editorial italic text-sm text-[#484c5c]">
            Your personal catalog of approved gothic ensembles. Ready to wear with one tap.
          </p>
        </div>

        <button
          onClick={() => setActiveTab("AI stylist")}
          className="gothic-enamel-btn flex items-center gap-2"
        >
          <Sparkles size={14} />
          <span>Compose with AI Stylist</span>
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {savedOutfits.map(outfit => {
          const outfitPieces = outfit.itemIds.map(id => items.find(i => i.id === id)).filter(Boolean);

          return (
            <div
              key={outfit.id}
              className="flex flex-col overflow-hidden rounded-[24px] border border-[#bcc0ce] bg-white/95 shadow-md transition hover:shadow-xl"
            >
              {/* Garment Grid Board */}
              <div className="relative flex h-[190px] items-center justify-center gap-2 bg-gradient-to-b from-[#e8ecf4] via-[#dfe3ed] to-[#d2d6e2] p-4 border-b border-[#bcc0ce]">
                {outfitPieces.map(piece => (
                  <div
                    key={piece!.id}
                    className="flex h-[145px] flex-1 items-center justify-center rounded-xl bg-white/80 border border-[#bcc0ce]/70 p-1.5 shadow-xs backdrop-blur-xs"
                  >
                    <GarmentIllustration item={piece!} />
                  </div>
                ))}

                <span className="absolute left-3 top-3 rounded-full border border-[#bcc0ce] bg-white/95 px-2.5 py-1 text-[9px] font-gothic font-bold tracking-widest uppercase text-[#0a0b10] shadow-xs">
                  {outfit.occasion.toUpperCase()}
                </span>
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-gothic font-bold uppercase tracking-wider text-[#0a0b10]">{outfit.name}</h3>
                {outfit.notes && (
                  <p className="mt-1.5 font-editorial italic text-xs leading-5 text-[#484c5c] line-clamp-2">{outfit.notes}</p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs font-gothic text-[#585c6e]">
                  <span>Worn {outfit.wearCount} times</span>
                  <span>{outfit.lastWornAt ? `Last: ${new Date(outfit.lastWornAt).toLocaleDateString()}` : "Never worn"}</span>
                </div>

                {/* Garments tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {outfitPieces.map(piece => (
                    <span
                      key={piece!.id}
                      className="flex items-center gap-1.5 rounded-full border border-[#bcc0ce] bg-white px-2.5 py-1 text-[10px] font-gothic font-semibold text-[#0a0b10] shadow-2xs"
                    >
                      <span className="h-2 w-2 rounded-full border border-black/15 shadow-2xs" style={{ background: piece!.dominantHex }} />
                      {piece!.name}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center justify-between border-t border-[#bcc0ce]/50 pt-4">
                  <button
                    onClick={() => markOutfitWorn(outfit.id)}
                    className="flex items-center gap-1.5 rounded-full border border-[#bcc0ce] bg-white px-3 py-1.5 font-gothic text-xs font-bold uppercase tracking-wider text-[#0a0b10] hover:bg-[#0a0b10] hover:text-white transition shadow-2xs"
                  >
                    <Footprints size={13} /> Worn today
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        saveOutfit({
                          name: `${outfit.name} (Copy)`,
                          occasion: outfit.occasion,
                          itemIds: outfit.itemIds
                        })
                      }
                      title="Duplicate outfit"
                      aria-label="Duplicate outfit"
                      className="rounded-full border border-[#bcc0ce] bg-white p-2 text-[#484c5c] hover:bg-[#0a0b10] hover:text-white transition shadow-2xs"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => deleteSavedOutfit(outfit.id)}
                      title="Delete outfit"
                      aria-label="Delete outfit"
                      className="rounded-full border border-rose-200 bg-white p-2 text-rose-600 hover:bg-rose-50 transition shadow-2xs"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {savedOutfits.length === 0 && (
        <div className="rounded-[24px] border border-[#bcc0ce] bg-white/90 p-12 text-center shadow-md backdrop-blur-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0b10] text-white shadow-md border border-[#202330]">
            <Heart size={26} className="text-white" />
          </div>
          <div className="eyebrow mt-4 text-[#585c6e]">ATELIER ARCHIVE &bull; EMPTY REPERTORY</div>
          <h3 className="mt-1 text-xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">Your saved looks will live here</h3>
          <p className="mt-2 font-editorial italic text-sm text-[#484c5c] max-w-md mx-auto">
            When you compose an outfit you love in the AI Stylist, save it to access and catalog it in your permanent couture archive.
          </p>
          <button
            onClick={() => setActiveTab("AI stylist")}
            className="gothic-enamel-btn mt-6 inline-flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>Explore AI Stylist</span>
          </button>
        </div>
      )}
    </div>
  );
}
