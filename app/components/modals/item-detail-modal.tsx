"use client";

import React, { useState } from "react";
import {
  X, Heart, Sparkles, Footprints, Trash2, Edit3, Calendar, Check, ArrowUpRight, Download, Wand2, Loader2
} from "lucide-react";
import { WardrobeItem } from "../../../lib/types/wardrobe";
import { useWardrobe } from "../../../lib/store/wardrobe-context";
import { GarmentIllustration } from "../ui/garment-illustration";

export function ItemDetailModal({
  item,
  onClose,
  onBuildOutfitAround
}: {
  item: WardrobeItem | null;
  onClose: () => void;
  onBuildOutfitAround: (itemId: string) => void;
}) {
  const { toggleFavorite, deleteItem, markItemWorn, updateItem } = useWardrobe();
  const [viewOriginal, setViewOriginal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [isProcessingStudio, setIsProcessingStudio] = useState(false);
  const [studioMessage, setStudioMessage] = useState<string | null>(null);

  if (!item) return null;

  const handleStartEdit = () => {
    setEditedName(item.name);
    setEditedNotes(item.attributes.notes || "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateItem(item.id, {
      name: editedName.trim() || item.name,
      attributes: {
        ...item.attributes,
        notes: editedNotes.trim() || undefined
      }
    });
    setIsEditing(false);
  };

  const handleRunStudioProcessing = async () => {
    const sourceImage = item.originalImagePath || item.processedImagePath;
    if (!sourceImage || !sourceImage.startsWith("data:")) return;

    setIsProcessingStudio(true);
    setStudioMessage("Preparing garment in Gemini AI Studio...");

    try {
      const mimeType = sourceImage.startsWith("data:image/png") ? "image/png" : "image/jpeg";
      const res = await fetch("/api/wardrobe/process-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: sourceImage,
          mimeType,
          originalName: item.name
        })
      });

      if (!res.ok) {
        throw new Error("Studio processing failed.");
      }

      const data = await res.json();
      if (data.processedImage) {
        updateItem(item.id, {
          processedImagePath: data.processedImage,
          aiAnalysisStatus: "completed"
        });
        setViewOriginal(false);
        setStudioMessage("Garment isolated in luxury atelier studio lighting!");
        setTimeout(() => setStudioMessage(null), 3000);
      }
    } catch {
      setStudioMessage("Could not process studio photo. Preserved original.");
      setTimeout(() => setStudioMessage(null), 3000);
    } finally {
      setIsProcessingStudio(false);
    }
  };

  const activePhoto = viewOriginal && item.originalImagePath
    ? item.originalImagePath
    : (item.processedImagePath || item.originalImagePath);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] sm:rounded-[24px] bg-[#0d0e15] border border-white/10 text-white shadow-2xl safe-pb">
        {/* Mobile drag handle */}
        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Top Garment Preview Stage */}
        <div className="relative flex h-[320px] items-center justify-center bg-gradient-to-b from-[#141624] to-[#0c0d15] p-6 overflow-hidden border-b border-white/10">
          {viewOriginal && item.originalImagePath ? (
            <img
              src={item.originalImagePath}
              alt={item.name}
              className="max-h-full max-w-full rounded-xl object-contain shadow-sm"
            />
          ) : (
            <GarmentIllustration item={item} large />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full border border-white/10 bg-[#161722] p-2 text-[#9094a6] hover:bg-[#20222f] hover:text-white transition shadow-sm backdrop-blur"
          >
            <X size={16} />
          </button>

          {/* Catalog / Original Switcher if user uploaded photo */}
          {item.originalImagePath && (
            <div className="absolute bottom-4 left-4 flex gap-1 rounded-full border border-white/15 bg-[#12141f]/90 p-1 shadow-sm backdrop-blur">
              <button
                onClick={() => setViewOriginal(false)}
                className={`rounded-full px-3 py-1 font-gothic text-[10px] font-bold tracking-wider transition ${
                  !viewOriginal ? "bg-white text-black" : "text-[#8e92a4] hover:text-white"
                }`}
              >
                Catalog View
              </button>
              <button
                onClick={() => setViewOriginal(true)}
                className={`rounded-full px-3 py-1 font-gothic text-[10px] font-bold tracking-wider transition ${
                  viewOriginal ? "bg-white text-black" : "text-[#8e92a4] hover:text-white"
                }`}
              >
                Original Photo
              </button>
            </div>
          )}

          {/* Download & Studio Polish Button */}
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
            {activePhoto && (
              <a
                href={activePhoto}
                download={`${item.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${viewOriginal ? "original" : "studio"}.png`}
                aria-label="Download photograph"
                className="flex items-center gap-1 rounded-full border border-white/15 bg-[#161826] px-2.5 py-1 text-[10px] font-gothic font-bold text-white shadow-sm backdrop-blur hover:bg-[#202336] transition"
              >
                <Download size={12} />
                <span className="hidden sm:inline">Save</span>
              </a>
            )}

            {item.originalImagePath && item.originalImagePath.startsWith("data:") && (
              <button
                onClick={handleRunStudioProcessing}
                disabled={isProcessingStudio}
                className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-gothic font-bold text-black shadow-sm hover:bg-[#e2e5ee] transition disabled:opacity-50"
              >
                {isProcessingStudio ? (
                  <Loader2 size={12} className="animate-spin text-black" />
                ) : (
                  <Wand2 size={12} />
                )}
                <span>{isProcessingStudio ? "Transforming..." : "Gemini Studio"}</span>
              </button>
            )}
          </div>

          {/* Category Tag */}
          <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#12141f]/90 px-3 py-1 font-gothic text-[10px] font-bold tracking-widest text-white uppercase shadow-sm">
            {item.category.toUpperCase()} &bull; {item.subcategory.toUpperCase()}
          </span>

          {/* Status Message Overlay */}
          {studioMessage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/85 p-4 text-center">
              <span className="font-gothic text-xs font-bold uppercase tracking-wider text-white">{studioMessage}</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  value={editedName}
                  onChange={e => setEditedName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-[#161826] p-2.5 font-gothic text-lg font-bold text-white outline-none focus:border-white"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-gothic font-bold uppercase tracking-wider text-white">{item.name}</h2>
              )}

              <div className="mt-2 flex items-center gap-2 text-xs text-[#8e92a4]">
                <span
                  className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-2xs"
                  style={{ background: item.dominantHex }}
                />
                <span className="font-gothic font-bold text-white">{item.colorName}</span>
                <span>&bull;</span>
                <span className="font-gothic">{item.attributes.fit || "Regular"} Fit</span>
                {item.attributes.material && (
                  <>
                    <span>&bull;</span>
                    <span className="font-editorial italic">{item.attributes.material}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => toggleFavorite(item.id)}
              aria-label="Toggle favorite"
              className={`rounded-full border p-2.5 transition ${
                item.favorite
                  ? "border-rose-500/30 bg-rose-950/40 text-rose-300"
                  : "border-white/15 bg-[#161826] text-[#8e92a4] hover:text-white"
              }`}
            >
              <Heart size={18} fill={item.favorite ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Wear History Metric Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-[#161826] p-3">
              <span className="eyebrow text-[#85899b]">TIMES WORN</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-gothic text-2xl font-bold text-white">{item.wearCount}</span>
                <span className="text-xs text-[#8e92a4]">times</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/15 bg-[#161826] p-3">
              <span className="eyebrow text-[#85899b]">LAST WORN</span>
              <div className="mt-1 font-gothic text-sm font-bold text-white">
                {item.lastWornAt ? new Date(item.lastWornAt).toLocaleDateString() : "Never"}
              </div>
            </div>

            <div className="col-span-2 rounded-xl border border-white/15 bg-[#161826] p-3 sm:col-span-1">
              <span className="eyebrow text-[#85899b]">AI ANALYSIS</span>
              <div className="mt-1 flex items-center gap-1.5 font-gothic text-xs font-bold text-white">
                <Sparkles size={13} className="text-white" />
                <span>{item.aiConfidence ? `${item.aiConfidence}% match` : "Catalog active"}</span>
              </div>
            </div>
          </div>

          {/* Occasions & Seasons Badges */}
          <div className="mt-5 space-y-3">
            <div>
              <span className="eyebrow text-[#85899b]">SUITABLE OCCASIONS</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(item.attributes.occasions || ["Everyday"]).map(occ => (
                  <span
                    key={occ}
                    className="rounded-full border border-white/15 bg-[#161826] px-3 py-1 font-gothic text-[11px] font-semibold text-white"
                  >
                    {occ}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="eyebrow text-[#85899b]">SEASONS</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(item.attributes.seasons || ["All-Season"]).map(sea => (
                  <span
                    key={sea}
                    className="rounded-full border border-white/15 bg-[#161826] px-3 py-1 font-gothic text-[11px] font-semibold text-white"
                  >
                    {sea}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
            <button
              onClick={() => markItemWorn(item.id)}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#161826] px-4 py-2 font-gothic text-xs font-bold uppercase tracking-wider text-white hover:bg-[#202336] transition shadow-xs"
            >
              <Footprints size={14} /> Worn today
            </button>

            <button
              onClick={() => {
                onBuildOutfitAround(item.id);
                onClose();
              }}
              className="gothic-enamel-btn flex flex-1 items-center justify-center gap-1.5 !py-2.5 !text-xs !bg-white !text-black"
            >
              <Sparkles size={14} /> Build outfit with this <ArrowUpRight size={14} />
            </button>

            {isEditing ? (
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1 rounded-full bg-white px-4 py-2 font-gothic text-xs font-bold text-black shadow"
              >
                <Check size={14} /> Save
              </button>
            ) : (
              <button
                onClick={handleStartEdit}
                aria-label="Edit piece"
                className="rounded-full border border-white/15 bg-[#161826] p-2 text-[#8e92a4] hover:text-white transition"
              >
                <Edit3 size={15} />
              </button>
            )}

            <button
              onClick={() => {
                if (confirm(`Remove "${item.name}" from your wardrobe?`)) {
                  deleteItem(item.id);
                  onClose();
                }
              }}
              aria-label="Delete piece"
              className="rounded-full border border-rose-500/30 bg-rose-950/20 p-2 text-rose-300 hover:bg-rose-900/40 transition"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
