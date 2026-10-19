"use client";

import React, { useState } from "react";
import { Palette, Check, RefreshCw, Plus, X } from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";
import { COLOR_REGISTRY } from "../../../lib/services/color-harmony";
import { PaletteDirection, ContrastPreference } from "../../../lib/types/profile";

const PALETTE_EXAMPLES: Record<PaletteDirection, string[]> = {
  "Balanced neutrals": ["#111218", "#787c8c", "#c2c6d2", "#e8ebf2", "#ffffff"],
  "Warm neutrals": ["#1a1917", "#52443a", "#8c7a6e", "#c4b5a5", "#f0eae1"],
  "Cool tones": ["#0d1117", "#24324a", "#566b8c", "#9cb2d0", "#e8edf5"],
  "Earthy tones": ["#141712", "#3a4032", "#636d52", "#9ba686", "#dbe3cd"],
  "Monochromatic": ["#08080a", "#1e2029", "#484b5c", "#9296a8", "#f0f2f8"],
  "Bold & vibrant": ["#0a0b10", "#8a1c32", "#1e3a8a", "#9a3412", "#ffffff"]
};

export function ColorPreferencesView() {
  const { profile, updateProfile } = useWardrobe();
  const [successMsg, setSuccessMsg] = useState("");

  const toggleFavoriteColor = (color: string) => {
    const curr = profile.favoriteColors || [];
    const updated = curr.includes(color) ? curr.filter(c => c !== color) : [...curr, color];
    updateProfile({ favoriteColors: updated });
    triggerSaveMessage();
  };

  const toggleDislikedColor = (color: string) => {
    const curr = profile.dislikedColors || [];
    const updated = curr.includes(color) ? curr.filter(c => c !== color) : [...curr, color];
    updateProfile({ dislikedColors: updated });
    triggerSaveMessage();
  };

  const triggerSaveMessage = () => {
    setSuccessMsg("Preferences saved. Outfits will reflect this palette immediately.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <div className="eyebrow text-[#585c6e]">YOUR COLOR STORY &bull; CHROMATIC DISCIPLINE</div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">Color Preferences</h1>
        <p className="mt-1 font-editorial italic text-sm text-[#484c5c]">
          Customize your palette. The recommendation engine uses these rules to calculate color harmony scores and select accents.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#0a0b10]/20 bg-white/90 px-4 py-3 text-xs font-gothic font-bold text-[#0a0b10] shadow-md">
          <Check size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Palette Direction */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#0a0b10]">Dominant Palette Direction</h2>
        <p className="mt-1 font-editorial italic text-xs text-[#585c6e]">
          Select the overarching chromatic tone that best represents your gothic couture rotation.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(PALETTE_EXAMPLES) as PaletteDirection[]).map(p => {
            const active = profile.paletteDirection === p;
            const swatches = PALETTE_EXAMPLES[p];

            return (
              <button
                key={p}
                onClick={() => {
                  updateProfile({ paletteDirection: p });
                  triggerSaveMessage();
                }}
                className={`flex flex-col rounded-2xl border p-4 text-left transition shadow-2xs ${
                  active
                    ? "border-[#0a0b10] bg-[#0a0b10] text-white shadow-xs"
                    : "border-[#bcc0ce] bg-white text-[#0a0b10] hover:border-[#8e93a6] hover:bg-[#f8f9fc]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-gothic text-xs font-bold uppercase tracking-wider ${active ? "text-white" : "text-[#0a0b10]"}`}>{p}</span>
                  {active && <Check size={14} className="text-white" />}
                </div>

                <div className="mt-3 flex gap-1.5">
                  {swatches.map(hex => (
                    <span
                      key={hex}
                      className="h-5 flex-1 rounded-md border border-white/20 shadow-2xs"
                      style={{ background: hex }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contrast Level */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#0a0b10]">Preferred Visual Contrast</h2>
        <p className="mt-1 font-editorial italic text-xs text-[#585c6e]">
          How bold should the tonal separation be between your tops, bottoms, and outerwear?
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["High contrast", "Medium contrast", "Low contrast / Tonal"] as ContrastPreference[]).map(level => {
            const active = profile.preferredContrast === level;
            return (
              <button
                key={level}
                onClick={() => {
                  updateProfile({ preferredContrast: level });
                  triggerSaveMessage();
                }}
                className={`rounded-full px-4 py-2 font-gothic text-xs uppercase tracking-wider transition ${
                  active
                    ? "bg-[#0a0b10] text-white font-bold shadow-xs border border-[#0a0b10]"
                    : "border border-[#bcc0ce] bg-white text-[#424656] font-semibold hover:border-[#8e93a6] hover:bg-[#f8f9fc]"
                }`}
              >
                {level} {active && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Favorite Colors */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#0a0b10]">Favorite Colors</h2>
        <p className="mt-1 font-editorial italic text-xs text-[#585c6e]">
          Colors you love wearing. Outfits featuring these tones will receive a score bonus.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(COLOR_REGISTRY).map(c => {
            const active = profile.favoriteColors?.includes(c);
            const hex = COLOR_REGISTRY[c].hex;
            return (
              <button
                key={c}
                onClick={() => toggleFavoriteColor(c)}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-gothic text-xs tracking-wider transition ${
                  active
                    ? "border-[#0a0b10] bg-[#0a0b10] text-white font-bold shadow-xs"
                    : "border-[#bcc0ce] bg-white text-[#424656] font-semibold hover:border-[#8e93a6] hover:bg-[#f8f9fc]"
                }`}
              >
                <span className="h-3 w-3 rounded-full border border-black/15 shadow-2xs" style={{ background: hex }} />
                <span>{c}</span>
                {active && <Check size={12} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Disliked Colors */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#0a0b10]">Disliked Colors (Avoid)</h2>
        <p className="mt-1 font-editorial italic text-xs text-[#585c6e]">
          Colors you prefer not to wear. The engine will avoid building primary looks around these tones.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(COLOR_REGISTRY).map(c => {
            const active = profile.dislikedColors?.includes(c);
            const hex = COLOR_REGISTRY[c].hex;
            return (
              <button
                key={c}
                onClick={() => toggleDislikedColor(c)}
                className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-gothic text-xs tracking-wider transition ${
                  active
                    ? "border-rose-400 bg-rose-950/20 text-rose-800 font-bold"
                    : "border-[#bcc0ce] bg-white text-[#424656] font-semibold hover:border-[#8e93a6] hover:bg-[#f8f9fc]"
                }`}
              >
                <span className="h-3 w-3 rounded-full border border-black/15 shadow-2xs" style={{ background: hex }} />
                <span>{c}</span>
                {active && <X size={12} className="text-rose-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
