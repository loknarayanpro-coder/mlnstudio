"use client";

import React, { useState } from "react";
import {
  Sparkles, WandSparkles, Heart, Footprints, RefreshCw, Check, AlertCircle,
  ThumbsDown, ChevronDown, Info, Sliders, ArrowUpRight, Plus, X, Layers
} from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";
import { Occasion, WardrobeItem, MainCategory } from "../../../lib/types/wardrobe";
import { PaletteDirection } from "../../../lib/types/profile";
import { OutfitRecommendation, RejectionReason } from "../../../lib/types/outfit";
import { GarmentIllustration } from "../ui/garment-illustration";

const OCCASIONS: Occasion[] = [
  "Everyday",
  "Casual",
  "Smart casual",
  "Office",
  "Formal",
  "Party",
  "Date night",
  "Weekend",
  "Travel",
  "Festive",
  "Wedding guest"
];

const PALETTES: PaletteDirection[] = [
  "Balanced neutrals",
  "Warm neutrals",
  "Cool tones",
  "Earthy tones",
  "Monochromatic",
  "Bold & vibrant"
];

const REJECTION_REASONS: RejectionReason[] = [
  "Color combination",
  "Style",
  "Occasion",
  "Fit preference",
  "Too formal",
  "Too casual",
  "Repeated outfit",
  "Weather mismatch"
];

export function StylistView({
  anchorItemId,
  onClearAnchor,
  onOpenAddModal
}: {
  anchorItemId?: string;
  onClearAnchor: () => void;
  onOpenAddModal?: () => void;
}) {
  const {
    items,
    recommendations,
    selectedOccasion,
    setSelectedOccasion,
    profile,
    updateProfile,
    saveOutfit,
    recordOutfitFeedback,
    markItemWorn,
    weather,
    setActiveTab
  } = useWardrobe();

  const [activeFeedbackModal, setActiveFeedbackModal] = useState<OutfitRecommendation | null>(null);
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState<string>("");
  const [builderMode, setBuilderMode] = useState<boolean>(false);
  const [outfitTypeFilter, setOutfitTypeFilter] = useState<"all" | "dresses" | "separates">("all");

  // Manual Builder State
  const [builderType, setBuilderType] = useState<"separates" | "dress">("separates");
  const [builderDress, setBuilderDress] = useState<WardrobeItem | null>(null);
  const [builderTop, setBuilderTop] = useState<WardrobeItem | null>(null);
  const [builderBottom, setBuilderBottom] = useState<WardrobeItem | null>(null);
  const [builderShoes, setBuilderShoes] = useState<WardrobeItem | null>(null);
  const [builderOuter, setBuilderOuter] = useState<WardrobeItem | null>(null);
  const [builderBag, setBuilderBag] = useState<WardrobeItem | null>(null);
  const [builderOutfitName, setBuilderOutfitName] = useState<string>("Custom Curated Look");

  const anchorItem = items.find(i => i.id === anchorItemId);

  // Filter recommendations by type (All, Dresses & Combos, Separates)
  const dressOutfitsCount = recommendations.filter(rec => rec.items.some(i => i.category === "Dresses & One-Pieces")).length;
  const separatesOutfitsCount = recommendations.filter(rec => !rec.items.some(i => i.category === "Dresses & One-Pieces")).length;

  const displayedRecommendations = recommendations.filter(rec => {
    const hasDress = rec.items.some(i => i.category === "Dresses & One-Pieces");
    if (outfitTypeFilter === "dresses") return hasDress;
    if (outfitTypeFilter === "separates") return !hasDress;
    return true;
  });

  const handleSaveRecommendation = (rec: OutfitRecommendation) => {
    saveOutfit({
      name: rec.title,
      occasion: rec.occasion,
      itemIds: rec.items.map(i => i.id),
      notes: rec.explanation
    });
    recordOutfitFeedback({
      outfitId: rec.id,
      itemIds: rec.items.map(i => i.id),
      type: "save"
    });
    setFeedbackSuccessMessage(`"${rec.title}" saved to your outfits!`);
    setTimeout(() => setFeedbackSuccessMessage(""), 3500);
  };

  const handleLoveRecommendation = (rec: OutfitRecommendation) => {
    recordOutfitFeedback({
      outfitId: rec.id,
      itemIds: rec.items.map(i => i.id),
      type: "love"
    });
    setFeedbackSuccessMessage(`Saved preference! We'll recommend more looks with this palette.`);
    setTimeout(() => setFeedbackSuccessMessage(""), 3500);
  };

  const handleRejectOutfit = (reason: RejectionReason) => {
    if (!activeFeedbackModal) return;
    recordOutfitFeedback({
      outfitId: activeFeedbackModal.id,
      itemIds: activeFeedbackModal.items.map(i => i.id),
      type: "not_for_me",
      reason
    });
    setActiveFeedbackModal(null);
    setFeedbackSuccessMessage(`Understood. Recommendation engine adjusted for "${reason}".`);
    setTimeout(() => setFeedbackSuccessMessage(""), 3500);
  };

  const handleMarkWorn = (rec: OutfitRecommendation) => {
    rec.items.forEach(item => markItemWorn(item.id));
    recordOutfitFeedback({
      outfitId: rec.id,
      itemIds: rec.items.map(i => i.id),
      type: "worn"
    });
    setFeedbackSuccessMessage("Marked this outfit as worn today! Wear count updated.");
    setTimeout(() => setFeedbackSuccessMessage(""), 3500);
  };

  const handleSaveManualBuilder = () => {
    const selected: WardrobeItem[] = [];

    if (builderType === "dress") {
      if (!builderDress) {
        alert("Please select a dress or one-piece for this look.");
        return;
      }
      selected.push(builderDress);
      if (builderShoes) selected.push(builderShoes);
      if (builderOuter) selected.push(builderOuter);
      if (builderBag) selected.push(builderBag);
    } else {
      if (builderTop) selected.push(builderTop);
      if (builderBottom) selected.push(builderBottom);
      if (builderShoes) selected.push(builderShoes);
      if (builderOuter) selected.push(builderOuter);

      if (selected.length < 2) {
        alert("Please select at least a top and bottom to save an outfit.");
        return;
      }
    }

    saveOutfit({
      name: builderOutfitName.trim() || (builderType === "dress" ? "Curated Dress Combo" : "Custom Outfit"),
      occasion: selectedOccasion,
      itemIds: selected.map(i => i.id),
      notes: "Created with Interactive Outfit Builder"
    });

    setFeedbackSuccessMessage(`"${builderOutfitName}" saved to your Saved Outfits!`);
    setBuilderMode(false);
    setTimeout(() => setFeedbackSuccessMessage(""), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow text-[#585c6e]">YOUR ON-DEMAND PERSONAL STYLIST</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">
            AI Stylist & Outfit Engine
          </h1>
          <p className="mt-1 font-editorial italic text-sm text-[#484c5c] max-w-xl">
            Every outfit is deterministically composed from garments you actually own, scored for color harmony, occasion, and weather.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBuilderMode(false)}
            className={`transition ${
              !builderMode
                ? "gothic-enamel-btn"
                : "rounded-full border border-[#bcc0ce] bg-white/80 px-4 py-2 font-gothic text-xs font-semibold uppercase tracking-wider text-[#383c4c] hover:bg-white hover:text-black shadow-2xs"
            }`}
          >
            <Sparkles size={13} className="mr-1.5 inline" /> AI Recommendations
          </button>
          <button
            onClick={() => setBuilderMode(true)}
            className={`transition ${
              builderMode
                ? "gothic-enamel-btn"
                : "rounded-full border border-[#bcc0ce] bg-white/80 px-4 py-2 font-gothic text-xs font-semibold uppercase tracking-wider text-[#383c4c] hover:bg-white hover:text-black shadow-2xs"
            }`}
          >
            <Sliders size={13} className="mr-1.5 inline" /> Interactive Builder
          </button>
        </div>
      </div>

      {feedbackSuccessMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#0a0b10]/20 bg-white/90 px-4 py-3 text-xs font-gothic font-bold tracking-wider text-[#0a0b10] shadow-md backdrop-blur-md">
          <Check size={16} className="text-[#0a0b10]" />
          <span>{feedbackSuccessMessage}</span>
        </div>
      )}

      {/* Anchor Item Banner if active */}
      {anchorItem && (
        <div className="flex items-center justify-between rounded-[22px] border border-[#bcc0ce] bg-white/85 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#bcc0ce] bg-white shadow-xs">
              <GarmentIllustration item={anchorItem} />
            </div>
            <div>
              <div className="eyebrow text-[#585c6e]">STYLING ANCHOR PIECE</div>
              <div className="font-gothic text-sm font-bold uppercase tracking-wider text-[#0a0b10]">{anchorItem.name}</div>
            </div>
          </div>
          <button
            onClick={onClearAnchor}
            className="secondary flex items-center gap-1.5 !py-1.5 !px-3 text-xs font-gothic"
          >
            <X size={13} /> Clear anchor
          </button>
        </div>
      )}

      {!builderMode ? (
        /* AI RECOMMENDATIONS MODE */
        <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
          {/* Controls Sidebar */}
          <div className="space-y-5 rounded-[24px] border border-[#bcc0ce] bg-white/85 p-5 shadow-sm backdrop-blur-sm">
            <div>
              <div className="eyebrow text-[#585c6e]">TUNE YOUR OCCASION</div>
              <label className="mt-3 block text-xs font-gothic font-bold uppercase tracking-wider text-[#222532]">Occasion</label>
              <select
                value={selectedOccasion}
                onChange={e => setSelectedOccasion(e.target.value as Occasion)}
                className="mt-1.5 w-full rounded-xl border border-[#bcc0ce] bg-[#f4f6fa] p-2.5 font-gothic text-xs font-bold tracking-wider text-[#0a0b10] outline-none transition focus:border-[#0a0b10] shadow-2xs"
              >
                {OCCASIONS.map(occ => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="eyebrow text-[#585c6e]">COLOR DIRECTION</div>
              <div className="mt-2.5 flex flex-col gap-1.5">
                {PALETTES.map(p => {
                  const active = profile.paletteDirection === p;
                  return (
                    <button
                      key={p}
                      onClick={() => updateProfile({ paletteDirection: p })}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left font-gothic text-xs tracking-wider uppercase transition shadow-2xs ${
                        active
                          ? "border-[#0a0b10] bg-[#0a0b10] font-bold text-white shadow-xs"
                          : "border-[#c8ccd8] bg-[#f8f9fc] text-[#424656] font-semibold hover:border-[#8e93a4] hover:bg-white"
                      }`}
                    >
                      <span>{p}</span>
                      {active && <Check size={14} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recommendations Grid Header with Quick Dress & Separates Filters */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="eyebrow text-[#585c6e]">
                  {displayedRecommendations.length} OUTFITS AVAILABLE
                </div>
                {/* Outfit Type Quick-Filter Chips */}
                <div className="mt-1 flex items-center gap-1.5">
                  <button
                    onClick={() => setOutfitTypeFilter("all")}
                    className={`rounded-full px-3 py-1 text-[11px] font-gothic tracking-wider uppercase transition ${
                      outfitTypeFilter === "all"
                        ? "bg-[#0a0b10] text-white font-bold shadow-2xs"
                        : "bg-[#e2e5ee] text-[#424656] hover:bg-white"
                    }`}
                  >
                    All Combos ({recommendations.length})
                  </button>

                  <button
                    onClick={() => setOutfitTypeFilter("dresses")}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-gothic tracking-wider uppercase transition ${
                      outfitTypeFilter === "dresses"
                        ? "bg-[#0a0b10] text-white font-bold shadow-2xs"
                        : "bg-[#e2e5ee] text-[#424656] hover:bg-white"
                    }`}
                  >
                    <Sparkles size={11} className={outfitTypeFilter === "dresses" ? "text-amber-300" : "text-[#585c6e]"} />
                    <span>Dress Combos ({dressOutfitsCount})</span>
                  </button>

                  <button
                    onClick={() => setOutfitTypeFilter("separates")}
                    className={`rounded-full px-3 py-1 text-[11px] font-gothic tracking-wider uppercase transition ${
                      outfitTypeFilter === "separates"
                        ? "bg-[#0a0b10] text-white font-bold shadow-2xs"
                        : "bg-[#e2e5ee] text-[#424656] hover:bg-white"
                    }`}
                  >
                    Separates ({separatesOutfitsCount})
                  </button>
                </div>
              </div>

              <span className="self-start rounded-full border border-[#bcc0ce] bg-white px-3 py-1 text-[10px] font-gothic font-bold tracking-widest text-[#0a0b10] shadow-2xs sm:self-auto">
                ATELIER COMPOSER
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {displayedRecommendations.map(rec => (
                <div
                  key={rec.id}
                  className="flex flex-col overflow-hidden rounded-[24px] border border-[#bcc0ce] bg-white/95 shadow-md transition hover:shadow-xl"
                >
                  {/* Visual Outfit Board */}
                  <div className="relative flex min-h-[190px] items-center justify-center gap-2 bg-gradient-to-b from-[#e8ecf4] via-[#dfe3ed] to-[#d2d6e2] p-4 border-b border-[#bcc0ce]">
                    {rec.items.map(piece => (
                      <div
                        key={piece.id}
                        className="flex h-[145px] flex-1 items-center justify-center rounded-xl bg-white/80 border border-[#bcc0ce]/70 p-2 shadow-xs backdrop-blur-xs"
                      >
                        <GarmentIllustration item={piece} />
                      </div>
                    ))}

                    {/* Vibe and Score Badges */}
                    <span className="absolute left-3 top-3 rounded-full border border-[#bcc0ce] bg-white/95 px-2.5 py-1 text-[9px] font-gothic font-bold tracking-widest uppercase text-[#0a0b10] shadow-xs">
                      {rec.vibe}
                    </span>

                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#0a0b10] px-2.5 py-1 text-[11px] font-gothic font-bold text-white shadow-sm border border-[#202330]">
                      <Sparkles size={12} className="text-white" />
                      <span>{rec.score.totalScore}%</span>
                    </div>
                  </div>

                  {/* Outfit Info */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-gothic font-bold uppercase tracking-wider text-[#0a0b10]">{rec.title}</h3>
                    <p className="mt-1.5 font-editorial italic text-xs leading-5 text-[#484c5c]">{rec.explanation}</p>

                    {/* Styling Advice Callout */}
                    {rec.stylingTip && (
                      <div className="mt-3 rounded-xl border border-[#bcc0ce] bg-[#f4f6fa] p-2.5 text-[11px] font-gothic text-[#0a0b10]">
                        <span className="font-bold uppercase tracking-wider">Stylist Tip:</span> {rec.stylingTip}
                      </div>
                    )}

                    {/* Item Swatches */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {rec.items.map(item => (
                        <span
                          key={item.id}
                          className="flex items-center gap-1.5 rounded-full border border-[#bcc0ce] bg-white px-2.5 py-1 text-[10px] font-gothic font-semibold text-[#0a0b10] shadow-2xs"
                        >
                          <span className="h-2.5 w-2.5 rounded-full border border-black/15 shadow-2xs" style={{ background: item.dominantHex }} />
                          {item.name}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons Row */}
                    <div className="mt-auto flex items-center gap-2 pt-5 border-t border-[#bcc0ce]/50">
                      <button
                        onClick={() => handleSaveRecommendation(rec)}
                        className="gothic-enamel-btn flex-1 !py-2 !text-[10px]"
                      >
                        <Heart size={13} />
                        <span>Save outfit</span>
                      </button>

                      <button
                        onClick={() => handleLoveRecommendation(rec)}
                        title="Love this look (learn preference)"
                        className="rounded-full border border-[#bcc0ce] bg-white p-2 text-[#484c5c] hover:bg-[#0a0b10] hover:text-white transition shadow-2xs"
                      >
                        <Sparkles size={14} />
                      </button>

                      <button
                        onClick={() => handleMarkWorn(rec)}
                        title="Mark as worn today"
                        className="rounded-full border border-[#bcc0ce] bg-white p-2 text-[#484c5c] hover:bg-[#0a0b10] hover:text-white transition shadow-2xs"
                      >
                        <Footprints size={14} />
                      </button>

                      <button
                        onClick={() => setActiveFeedbackModal(rec)}
                        title="Not for me (refine recommendations)"
                        className="rounded-full border border-[#bcc0ce] bg-white p-2 text-[#585c6e] hover:text-rose-600 hover:border-rose-300 transition shadow-2xs"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayedRecommendations.length === 0 && (
              <div className="relative overflow-hidden rounded-[24px] border border-[#bcc0ce] bg-white/90 p-10 sm:p-14 text-center shadow-md backdrop-blur-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0a0b10] text-white shadow-md border border-[#202330]">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div className="eyebrow mt-4 text-[#585c6e]">ATELIER ARCHIVE &bull; OUTFIT ENGINE</div>
                <h3 className="mt-1 text-xl sm:text-2xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">
                  {items.length === 0 ? "0 Clothes in Archive" : "No Combos for Selected Filter"}
                </h3>
                <p className="mt-2 font-editorial italic text-sm leading-6 text-[#505466] max-w-md mx-auto">
                  {items.length === 0
                    ? "Your wardrobe starts completely empty. Add your dresses or clothing pieces, and the AI will immediately compose styled combinations, silhouettes, and pairings."
                    : outfitTypeFilter === "dresses"
                    ? "Add a dress or one-piece to your closet to generate dress silhouettes and styling combinations."
                    : "Add tops, bottoms, or layers to generate tailored combinations."}
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      if (onOpenAddModal) onOpenAddModal();
                      else setActiveTab("My wardrobe");
                    }}
                    className="gothic-enamel-btn flex items-center gap-2"
                  >
                    <Plus size={14} />
                    <span>Add Dress or Clothing Piece</span>
                  </button>

                  {items.length > 0 && outfitTypeFilter !== "all" && (
                    <button
                      onClick={() => setOutfitTypeFilter("all")}
                      className="rounded-full border border-[#bcc0ce] bg-white px-5 py-2.5 font-gothic text-xs font-bold uppercase tracking-wider text-[#0a0b10] hover:bg-[#f2f4fa] transition"
                    >
                      View All Combos ({recommendations.length})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* INTERACTIVE MANUAL BUILDER MODE */
        <div className="rounded-[24px] border border-[#bcc0ce] bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-md flex-1">
              <label className="eyebrow text-[#585c6e]">OUTFIT NAME</label>
              <input
                value={builderOutfitName}
                onChange={e => setBuilderOutfitName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#bcc0ce] bg-[#f4f6fa] px-3.5 py-2 font-gothic text-sm font-bold text-[#0a0b10] outline-none focus:border-[#0a0b10]"
              />
            </div>

            {/* Builder Type Toggle */}
            <div className="flex items-center gap-1.5 self-start rounded-full border border-[#bcc0ce] bg-[#f2f4fa] p-1 sm:self-auto">
              <button
                onClick={() => setBuilderType("separates")}
                className={`rounded-full px-3.5 py-1.5 font-gothic text-xs font-bold uppercase tracking-wider transition ${
                  builderType === "separates" ? "bg-[#0a0b10] text-white shadow-2xs" : "text-[#585c6e] hover:text-[#0a0b10]"
                }`}
              >
                Top + Bottom
              </button>
              <button
                onClick={() => setBuilderType("dress")}
                className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 font-gothic text-xs font-bold uppercase tracking-wider transition ${
                  builderType === "dress" ? "bg-[#0a0b10] text-white shadow-2xs" : "text-[#585c6e] hover:text-[#0a0b10]"
                }`}
              >
                <Sparkles size={12} className={builderType === "dress" ? "text-amber-300" : ""} />
                <span>Dress / One-Piece Combo</span>
              </button>
            </div>
          </div>

          {builderType === "dress" ? (
            /* DRESS & ONE-PIECE COMBO BUILDER */
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Slot 1: Dress / One-Piece */}
              <div className="rounded-2xl border border-[#bcc0ce] bg-[#f4f6fa] p-4 text-center">
                <span className="eyebrow text-[#585c6e]">DRESS / ONE-PIECE *</span>
                {builderDress ? (
                  <div className="mt-3">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-[#bcc0ce] p-2 shadow-xs">
                      <GarmentIllustration item={builderDress} />
                    </div>
                    <div className="mt-2 truncate font-gothic text-xs font-bold text-[#0a0b10] uppercase tracking-wide">{builderDress.name}</div>
                    <button
                      onClick={() => setBuilderDress(null)}
                      className="mt-2 text-[11px] font-gothic font-bold text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <select
                      onChange={e => {
                        const piece = items.find(i => i.id === e.target.value);
                        if (piece) setBuilderDress(piece);
                      }}
                      defaultValue=""
                      className="w-full rounded-xl border border-[#bcc0ce] bg-white p-2 font-gothic text-xs font-semibold text-[#0a0b10]"
                    >
                      <option value="" disabled>Select a Dress / Gown...</option>
                      {items.filter(i => i.category === "Dresses & One-Pieces").map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.colorName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Slot 2: Footwear */}
              <div className="rounded-2xl border border-[#bcc0ce] bg-[#f4f6fa] p-4 text-center">
                <span className="eyebrow text-[#585c6e]">FOOTWEAR</span>
                {builderShoes ? (
                  <div className="mt-3">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-[#bcc0ce] p-2 shadow-xs">
                      <GarmentIllustration item={builderShoes} />
                    </div>
                    <div className="mt-2 truncate font-gothic text-xs font-bold text-[#0a0b10] uppercase tracking-wide">{builderShoes.name}</div>
                    <button
                      onClick={() => setBuilderShoes(null)}
                      className="mt-2 text-[11px] font-gothic font-bold text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <select
                      onChange={e => {
                        const piece = items.find(i => i.id === e.target.value);
                        if (piece) setBuilderShoes(piece);
                      }}
                      defaultValue=""
                      className="w-full rounded-xl border border-[#bcc0ce] bg-white p-2 font-gothic text-xs font-semibold text-[#0a0b10]"
                    >
                      <option value="" disabled>Select Footwear...</option>
                      {items.filter(i => i.category === "Footwear").map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.colorName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Slot 3: Outerwear / Layer */}
              <div className="rounded-2xl border border-[#bcc0ce] bg-[#f4f6fa] p-4 text-center">
                <span className="eyebrow text-[#585c6e]">OUTERWEAR (OPTIONAL)</span>
                {builderOuter ? (
                  <div className="mt-3">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-[#bcc0ce] p-2 shadow-xs">
                      <GarmentIllustration item={builderOuter} />
                    </div>
                    <div className="mt-2 truncate font-gothic text-xs font-bold text-[#0a0b10] uppercase tracking-wide">{builderOuter.name}</div>
                    <button
                      onClick={() => setBuilderOuter(null)}
                      className="mt-2 text-[11px] font-gothic font-bold text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <select
                      onChange={e => {
                        const piece = items.find(i => i.id === e.target.value);
                        if (piece) setBuilderOuter(piece);
                      }}
                      defaultValue=""
                      className="w-full rounded-xl border border-[#bcc0ce] bg-white p-2 font-gothic text-xs font-semibold text-[#0a0b10]"
                    >
                      <option value="" disabled>Select Outerwear...</option>
                      {items.filter(i => i.category === "Outerwear").map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.colorName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Slot 4: Bag / Accessory */}
              <div className="rounded-2xl border border-[#bcc0ce] bg-[#f4f6fa] p-4 text-center">
                <span className="eyebrow text-[#585c6e]">BAG / ACCENT (OPTIONAL)</span>
                {builderBag ? (
                  <div className="mt-3">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-[#bcc0ce] p-2 shadow-xs">
                      <GarmentIllustration item={builderBag} />
                    </div>
                    <div className="mt-2 truncate font-gothic text-xs font-bold text-[#0a0b10] uppercase tracking-wide">{builderBag.name}</div>
                    <button
                      onClick={() => setBuilderBag(null)}
                      className="mt-2 text-[11px] font-gothic font-bold text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <select
                      onChange={e => {
                        const piece = items.find(i => i.id === e.target.value);
                        if (piece) setBuilderBag(piece);
                      }}
                      defaultValue=""
                      className="w-full rounded-xl border border-[#bcc0ce] bg-white p-2 font-gothic text-xs font-semibold text-[#0a0b10]"
                    >
                      <option value="" disabled>Select Bag or Accessory...</option>
                      {items.filter(i => i.category === "Bags" || i.category === "Accessories" || i.category === "Watches").map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.colorName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* SEPARATES (TOP + BOTTOM) BUILDER */
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Slot 1: Top */}
              <div className="rounded-2xl border border-[#bcc0ce] bg-[#f4f6fa] p-4 text-center">
                <span className="eyebrow text-[#585c6e]">TOP / SHIRT</span>
                {builderTop ? (
                  <div className="mt-3">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-[#bcc0ce] p-2 shadow-xs">
                      <GarmentIllustration item={builderTop} />
                    </div>
                    <div className="mt-2 truncate font-gothic text-xs font-bold text-[#0a0b10] uppercase tracking-wide">{builderTop.name}</div>
                    <button
                      onClick={() => setBuilderTop(null)}
                      className="mt-2 text-[11px] font-gothic font-bold text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <select
                      onChange={e => {
                        const piece = items.find(i => i.id === e.target.value);
                        if (piece) setBuilderTop(piece);
                      }}
                      defaultValue=""
                      className="w-full rounded-xl border border-[#bcc0ce] bg-white p-2 font-gothic text-xs font-semibold text-[#0a0b10]"
                    >
                      <option value="" disabled>Select a Top...</option>
                      {items.filter(i => i.category === "Tops").map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.colorName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Slot 2: Bottom */}
              <div className="rounded-2xl border border-[#bcc0ce] bg-[#f4f6fa] p-4 text-center">
                <span className="eyebrow text-[#585c6e]">BOTTOM</span>
                {builderBottom ? (
                  <div className="mt-3">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-[#bcc0ce] p-2 shadow-xs">
                      <GarmentIllustration item={builderBottom} />
                    </div>
                    <div className="mt-2 truncate font-gothic text-xs font-bold text-[#0a0b10] uppercase tracking-wide">{builderBottom.name}</div>
                    <button
                      onClick={() => setBuilderBottom(null)}
                      className="mt-2 text-[11px] font-gothic font-bold text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <select
                      onChange={e => {
                        const piece = items.find(i => i.id === e.target.value);
                        if (piece) setBuilderBottom(piece);
                      }}
                      defaultValue=""
                      className="w-full rounded-xl border border-[#bcc0ce] bg-white p-2 font-gothic text-xs font-semibold text-[#0a0b10]"
                    >
                      <option value="" disabled>Select a Bottom...</option>
                      {items.filter(i => i.category === "Bottoms").map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.colorName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Slot 3: Footwear */}
              <div className="rounded-2xl border border-[#bcc0ce] bg-[#f4f6fa] p-4 text-center">
                <span className="eyebrow text-[#585c6e]">FOOTWEAR</span>
                {builderShoes ? (
                  <div className="mt-3">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-[#bcc0ce] p-2 shadow-xs">
                      <GarmentIllustration item={builderShoes} />
                    </div>
                    <div className="mt-2 truncate font-gothic text-xs font-bold text-[#0a0b10] uppercase tracking-wide">{builderShoes.name}</div>
                    <button
                      onClick={() => setBuilderShoes(null)}
                      className="mt-2 text-[11px] font-gothic font-bold text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <select
                      onChange={e => {
                        const piece = items.find(i => i.id === e.target.value);
                        if (piece) setBuilderShoes(piece);
                      }}
                      defaultValue=""
                      className="w-full rounded-xl border border-[#bcc0ce] bg-white p-2 font-gothic text-xs font-semibold text-[#0a0b10]"
                    >
                      <option value="" disabled>Select Footwear...</option>
                      {items.filter(i => i.category === "Footwear").map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.colorName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Slot 4: Outerwear */}
              <div className="rounded-2xl border border-[#bcc0ce] bg-[#f4f6fa] p-4 text-center">
                <span className="eyebrow text-[#585c6e]">OUTERWEAR (OPTIONAL)</span>
                {builderOuter ? (
                  <div className="mt-3">
                    <div className="flex h-36 items-center justify-center rounded-xl bg-white border border-[#bcc0ce] p-2 shadow-xs">
                      <GarmentIllustration item={builderOuter} />
                    </div>
                    <div className="mt-2 truncate font-gothic text-xs font-bold text-[#0a0b10] uppercase tracking-wide">{builderOuter.name}</div>
                    <button
                      onClick={() => setBuilderOuter(null)}
                      className="mt-2 text-[11px] font-gothic font-bold text-rose-600 hover:underline uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <select
                      onChange={e => {
                        const piece = items.find(i => i.id === e.target.value);
                        if (piece) setBuilderOuter(piece);
                      }}
                      defaultValue=""
                      className="w-full rounded-xl border border-[#bcc0ce] bg-white p-2 font-gothic text-xs font-semibold text-[#0a0b10]"
                    >
                      <option value="" disabled>Select Outerwear...</option>
                      {items.filter(i => i.category === "Outerwear").map(i => (
                        <option key={i.id} value={i.id}>{i.name} ({i.colorName})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveManualBuilder}
              className="gothic-enamel-btn flex items-center gap-2"
            >
              <Check size={14} />
              <span>Save Curated Outfit</span>
            </button>
          </div>
        </div>
      )}

      {/* Rejection Feedback Dialog */}
      {activeFeedbackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setActiveFeedbackModal(null);
          }}
        >
          <div className="w-full max-w-md rounded-[24px] bg-[#0d0e15] border border-white/10 text-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow text-[#85899b]">ATELIER FEEDBACK &bull; REFINING TASTE</div>
                <h3 className="mt-1 text-lg font-gothic font-bold uppercase tracking-wider text-white">Why isn’t this look for you?</h3>
                <p className="mt-1 font-editorial italic text-xs text-[#9094a6]">
                  Your feedback helps the stylist engine avoid combinations that don't match your personal gothic aesthetic.
                </p>
              </div>
              <button
                onClick={() => setActiveFeedbackModal(null)}
                aria-label="Close"
                className="rounded-full border border-white/15 bg-[#161722] p-1.5 text-[#9094a6] hover:text-white"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              {REJECTION_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => handleRejectOutfit(reason)}
                  className="rounded-xl border border-white/15 bg-[#161826] p-2.5 text-left font-gothic text-xs font-bold tracking-wider text-white transition hover:border-white hover:bg-[#1f2233]"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
