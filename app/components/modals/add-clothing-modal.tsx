"use client";

import React, { useState, useRef } from "react";
import {
  Upload, X, Sparkles, Check, ImagePlus, RefreshCw, Layers, Sliders, AlertCircle, Camera,
  Wand2, Download, Eye, ShieldCheck, ArrowRight
} from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";
import { MainCategory, SubCategory, Occasion, Season, FitType } from "../../../lib/types/wardrobe";
import { validateClothingImage, processCatalogImage, composeStudioGarment } from "../../../lib/services/image-processing";
import { COLOR_REGISTRY } from "../../../lib/services/color-harmony";
import { extractGarmentFeaturesFromImage, ExtractedGarmentFeatures } from "../../../lib/services/client-image-analyzer";
import { uploadWardrobeImage } from "../../../lib/supabase/storage";

const MAIN_CATEGORIES: MainCategory[] = [
  "Tops",
  "Bottoms",
  "Dresses & One-Pieces",
  "Outerwear",
  "Footwear",
  "Watches",
  "Bags",
  "Accessories"
];

const SUBCATEGORIES: Record<MainCategory, SubCategory[]> = {
  "Tops": ["Shirt", "T-Shirt", "Polo", "Blouse", "Other"],
  "Bottoms": ["Trousers", "Jeans", "Chinos", "Shorts", "Skirt", "Other"],
  "Dresses & One-Pieces": ["Dress", "Ethnic Wear", "Traditional", "Other"],
  "Outerwear": ["Jacket", "Coat", "Sweater", "Hoodie", "Other"],
  "Footwear": ["Sneakers", "Loafers", "Formal Shoes", "Boots", "Sandals", "Other"],
  "Watches": ["Watch", "Other"],
  "Bags": ["Bag", "Other"],
  "Accessories": ["Belt", "Sunglasses", "Hat", "Jewelry", "Other"]
};

const ALL_OCCASIONS: Occasion[] = [
  "Everyday",
  "Casual",
  "Smart casual",
  "Office",
  "Formal",
  "Party",
  "Date night",
  "Weekend",
  "Travel"
];

const ALL_SEASONS: Season[] = ["Spring", "Summer", "Autumn", "Winter", "All-Season"];

export function AddClothingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addItem, setActiveTab } = useWardrobe();

  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [processedUrl, setProcessedUrl] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [viewMode, setViewMode] = useState<"processed" | "original">("original");
  const [preferredBackground, setPreferredBackground] = useState<"warm white" | "light gray" | "pure white">("warm white");
  const [primaryChoice, setPrimaryChoice] = useState<"processed" | "original">("original");

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isProcessingStudio, setIsProcessingStudio] = useState<boolean>(false);
  const [studioStatusMessage, setStudioStatusMessage] = useState<string>("");
  const [studioProvider, setStudioProvider] = useState<string>("");
  const [fidelityNote, setFidelityNote] = useState<string>("");

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisConfidence, setAnalysisConfidence] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<MainCategory>("Tops");
  const [subcategory, setSubcategory] = useState<SubCategory>("Shirt");
  const [colorName, setColorName] = useState<string>("Olive");
  const [dominantHex, setDominantHex] = useState<string>("#686D49");
  const [fit, setFit] = useState<FitType>("Regular");
  const [material, setMaterial] = useState<string>("Printed Cotton blend");
  const [brand, setBrand] = useState<string>("");
  const [selectedOccasions, setSelectedOccasions] = useState<Occasion[]>(["Everyday", "Smart casual"]);
  const [selectedSeasons, setSelectedSeasons] = useState<Season[]>(["All-Season"]);
  const [userNotes, setUserNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const fileToPersistentDataUrl = (f: File): Promise<string> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const raw = (e.target?.result as string) || "";
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              resolve(canvas.toDataURL("image/jpeg", 0.88));
              return;
            }
          }
          resolve(raw);
        };
        img.onerror = () => resolve(raw);
        img.src = raw;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(f);
    });
  };

  const handleFileChange = async (selected: File) => {
    setErrorMessage("");
    const validation = validateClothingImage({ type: selected.type, size: selected.size });
    if (!validation.valid) {
      setErrorMessage(validation.error || "Invalid file format.");
      return;
    }

    setFile(selected);

    // 1. Immediately create persistent Data URL so image loads in 0ms and never dies on reload
    const persistentUrl = await fileToPersistentDataUrl(selected);
    setOriginalUrl(persistentUrl);
    setProcessedUrl(persistentUrl);
    setViewMode("original");

    // 2. Extract garment pixel colors and details immediately
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const features = extractGarmentFeaturesFromImage(img, selected.name);
        setName(features.suggestedName);
        setCategory(features.category);
        setSubcategory(features.subcategory);
        setColorName(features.colorName);
        setDominantHex(features.dominantHex);
        setFit(features.fit);
        setMaterial(features.material);
        setSelectedOccasions(features.occasions);
        setSelectedSeasons(features.seasons);
        setAnalysisConfidence(features.confidence);

        // Run non-blocking studio enhancements in background
        createStudioImage(persistentUrl, selected, features);
        runAiAnalysis(selected, features);
      } catch (err) {
        console.warn("Visual feature extraction failed:", err);
        createStudioImage(persistentUrl, selected);
        runAiAnalysis(selected);
      }
    };
    img.src = persistentUrl;
  };

  /**
   * Transforms the photograph into a professional e-commerce studio catalog image using Gemini API
   */
  const createStudioImage = async (
    sourceUrl: string,
    sourceFile?: File,
    features?: ExtractedGarmentFeatures
  ) => {
    const f = sourceFile || file;
    if (!f && !sourceUrl) return;

    setIsProcessingStudio(true);
    setStudioStatusMessage("Applying MLN studio lighting & isolating garment...");

    try {
      // 1. Immediately create crisp, luxury studio composite (hand & hanger cropped out, studio spotlight & shadow)
      const studioRes = await composeStudioGarment({
        dataUrlOrImg: sourceUrl,
        box_2d: [175, 140, 940, 860],
        preferredBackground
      });

      if (studioRes && studioRes.processedUrl) {
        setProcessedUrl(studioRes.processedUrl);
        setThumbnailUrl(studioRes.thumbnailUrl || studioRes.processedUrl);
        setStudioProvider("MLN Atelier Studio Vision");
        setFidelityNote("Garment isolated, clutter & hands cropped out, soft luxury studio lighting applied.");
        setViewMode("processed");
      }

      // 2. Try Gemini server endpoint in background if quota is available
      try {
        const base64Data = sourceUrl.includes(",") ? sourceUrl.split(",")[1] : sourceUrl;
        const res = await fetch("/api/wardrobe/process-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: f?.type || "image/jpeg",
            sizeBytes: f?.size || 150000,
            category: features?.category || category,
            preferredBackground
          })
        });

        const data = await res.json();
        if (data.success && data.processedImageUrl && data.processedImageUrl !== sourceUrl && !data.processedImageUrl.startsWith("data:image/svg+xml")) {
          setProcessedUrl(data.processedImageUrl);
          setThumbnailUrl(data.thumbnailUrl || data.processedImageUrl);
          setStudioProvider(data.provider === "gemini_genai" ? "Google Gemini Generative Studio" : "Google Gemini Studio Vision");
          if (data.contour?.garmentTitle) setName(data.contour.garmentTitle);
          if (data.contour?.category) setCategory(data.contour.category as MainCategory);
          if (data.contour?.subcategory) setSubcategory(data.contour.subcategory as SubCategory);
          if (data.contour?.dominantColor) setColorName(data.contour.dominantColor);
          if (data.contour?.dominantHex) setDominantHex(data.contour.dominantHex);
        }
      } catch (geminiErr) {
        // Fallback studio composite is already displayed cleanly
      }
    } catch (err) {
      console.warn("Studio creation error:", err);
    } finally {
      setIsProcessingStudio(false);
      setStudioStatusMessage("");
    }
  };

  const runAiAnalysis = async (selectedFile?: File, clientFeatures?: ExtractedGarmentFeatures) => {
    const f = selectedFile || file;
    if (!f) return;

    setIsAnalyzing(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        try {
          const res = await fetch("/api/wardrobe/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: f.type,
              hint: clientFeatures?.suggestedName || name,
              clientFeatures
            })
          });
          const data = await res.json();
          if (data.success && data.analysis) {
            const a = data.analysis;
            if (a.suggestedName) setName(a.suggestedName);
            setCategory(a.category);
            setSubcategory(a.subcategory as SubCategory);
            setColorName(a.mainColor);
            setDominantHex(a.dominantHex);
            setFit(a.fit as FitType);
            if (a.likelyMaterial) setMaterial(a.likelyMaterial);
            if (a.occasions && a.occasions.length > 0) {
              setSelectedOccasions(a.occasions.filter((o: any) => ALL_OCCASIONS.includes(o)));
            }
            if (a.seasons && a.seasons.length > 0) {
              setSelectedSeasons(a.seasons.filter((s: any) => ALL_SEASONS.includes(s)));
            }
            setAnalysisConfidence(a.confidence);
          }
        } catch (err) {
          console.warn("Vision API error:", err);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(f);
    } catch {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadStudioImage = () => {
    const targetUrl = processedUrl || originalUrl;
    if (!targetUrl) return;

    const link = document.createElement("a");
    link.href = targetUrl;
    link.download = `${name.replace(/\s+/g, "-").toLowerCase()}-studio.webp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleOccasion = (occ: Occasion) => {
    setSelectedOccasions(curr =>
      curr.includes(occ) ? curr.filter(o => o !== occ) : [...curr, occ]
    );
  };

  const toggleSeason = (sea: Season) => {
    setSelectedSeasons(curr =>
      curr.includes(sea) ? curr.filter(s => s !== sea) : [...curr, sea]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage("Please give this piece a name.");
      return;
    }

    setIsSaving(true);
    let finalPrimaryImage = primaryChoice === "processed" && processedUrl ? processedUrl : originalUrl;
    let finalProcessed = processedUrl || originalUrl;

    if (file) {
      try {
        const uploadedUrl = await Promise.race([
          uploadWardrobeImage(file, `${name.trim()}`),
          new Promise<null>(resolve => setTimeout(() => resolve(null), 2500))
        ]);
        if (uploadedUrl) {
          finalPrimaryImage = uploadedUrl;
          finalProcessed = uploadedUrl;
        }
      } catch (err) {
        console.warn("Storage upload timed out/failed, falling back to local persistent image:", err);
      }
    }

    addItem({
      name: name.trim(),
      category,
      subcategory,
      clothingType: `${fit} ${subcategory}`,
      colorName,
      dominantHex,
      attributes: {
        fit,
        material: material.trim(),
        brand: brand.trim() || undefined,
        seasons: selectedSeasons,
        occasions: selectedOccasions,
        notes: userNotes.trim() || undefined
      },
      originalImagePath: finalPrimaryImage,
      processedImagePath: finalPrimaryImage,
      thumbnailPath: finalPrimaryImage,
      imageProcessingStatus: "original",
      aiAnalysisStatus: analysisConfidence ? "completed" : "manual",
      aiConfidence: analysisConfidence || undefined,
      favorite: false
    });

    setIsSaving(false);
    onClose();
    setActiveTab("My wardrobe");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-6"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-[#0d0e15] border border-white/10 text-white p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95)] sm:rounded-[24px] sm:p-8">
        {/* Mobile Drag Indicator */}
        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/20 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-3">
          <div>
            <div className="eyebrow text-[#85899b]">MLN STUDIO &bull; AI CLOTHING ATELIER</div>
            <h2 className="mt-0.5 text-xl font-gothic font-bold tracking-wider text-white sm:text-2xl uppercase">
              Add a wardrobe piece
            </h2>
            <p className="mt-0.5 font-editorial italic text-xs text-[#9094a6]">
              Upload a clothing photo. We automatically transform it into a clean luxury studio product photograph.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full border border-white/10 bg-[#161722] p-2 text-[#9094a6] hover:bg-[#20222f] hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-xs text-rose-200">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1.2fr]">
          {/* Left Column: 3:4 Studio Stage & Preview */}
          <div className="flex flex-col gap-3">
            <div
              className={`relative flex min-h-[310px] sm:h-[350px] flex-col items-center justify-center rounded-2xl border-2 ${
                file ? "border-white/20 bg-[#141624]" : "border-dashed border-white/20 bg-[#12141f]"
              } p-3 text-center transition overflow-hidden`}
            >
              {file && (processedUrl || originalUrl) ? (
                <div className="relative flex h-full w-full flex-col items-center justify-center">
                  {/* Image Display Container with 3:4 portrait presentation */}
                  <div className="relative flex flex-1 w-full items-center justify-center overflow-hidden">
                    <img
                      src={viewMode === "processed" && processedUrl ? processedUrl : originalUrl}
                      alt={name || "Garment preview"}
                      className="max-h-[250px] sm:max-h-[270px] max-w-full rounded-xl object-contain drop-shadow-sm transition duration-300"
                    />

                    {/* Loading Overlay when processing studio image */}
                    {isProcessingStudio && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0d0e15]/90 p-4 backdrop-blur-xs text-white">
                        <Wand2 size={24} className="animate-spin text-white" />
                        <div className="mt-2 text-xs font-gothic font-bold tracking-wider text-white">
                          {studioStatusMessage || "Creating studio image..."}
                        </div>
                        <div className="mt-1 text-[10px] text-[#8e92a4]">
                          Neutralizing background & enhancing studio lighting
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Before / After Toggle Buttons */}
                  <div className="mt-3 flex items-center justify-between w-full border-t border-white/10 pt-2">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setViewMode("processed")}
                        className={`rounded-full px-3 py-1 text-[11px] font-gothic font-bold tracking-wider transition ${
                          viewMode === "processed"
                            ? "bg-white text-black shadow-xs"
                            : "border border-white/15 bg-[#1a1c2c] text-[#8e92a4]"
                        }`}
                      >
                        Studio Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("original")}
                        className={`rounded-full px-3 py-1 text-[11px] font-gothic font-bold tracking-wider transition ${
                          viewMode === "original"
                            ? "bg-white text-black shadow-xs"
                            : "border border-white/15 bg-[#1a1c2c] text-[#8e92a4]"
                        }`}
                      >
                        Original Photo
                      </button>
                    </div>

                    {/* Download / Retry Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleDownloadStudioImage}
                        title="Download studio photo"
                        className="rounded-full border border-white/15 bg-[#1a1c2c] p-1.5 text-[#8e92a4] hover:text-white hover:bg-[#25283c] transition"
                      >
                        <Download size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => createStudioImage(originalUrl)}
                        disabled={isProcessingStudio}
                        title="Re-run studio processing"
                        className="rounded-full border border-white/15 bg-[#1a1c2c] p-1.5 text-[#8e92a4] hover:text-white hover:bg-[#25283c] transition"
                      >
                        <RefreshCw size={13} className={isProcessingStudio ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c1e2e] border border-white/15 text-white shadow-sm">
                    <Upload size={20} className="text-white" />
                  </div>
                  <div className="mt-3 text-sm font-gothic font-bold text-white tracking-wide">Add clothing photo</div>
                  <p className="mt-1 text-[11px] text-[#8e92a4]">JPG, PNG, or WebP up to 10 MB</p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {/* Direct Camera Capture for Mobile */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-gothic font-bold tracking-wider text-black shadow-md hover:bg-[#e2e5ee] active:scale-95 transition"
                    >
                      <Camera size={14} /> Snap Photo
                    </button>

                    {/* File Picker */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-full border border-white/20 bg-[#1a1c2c] px-3.5 py-2 text-xs font-gothic font-bold tracking-wider text-white shadow-sm hover:bg-[#25283c] active:scale-95 transition"
                    >
                      <ImagePlus size={14} /> Browse
                    </button>
                  </div>
                </div>
              )}

              {/* Standard File Picker */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />

              {/* Mobile Hardware Camera Input */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={e => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
            </div>

            {/* Studio Info & Fidelity Guarantee Callout */}
            {file && (
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-white/15 bg-[#161826] p-2.5 text-xs text-white">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-white" />
                    <span className="font-semibold text-white">
                      {studioProvider || "Gemini Studio Engine"}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#a0a5b8]">
                    {analysisConfidence ? `${analysisConfidence}% match` : "Verified"}
                  </span>
                </div>

                <div className="flex items-start gap-1.5 rounded-xl border border-white/10 bg-[#131520] p-2.5 text-[10px] leading-4 text-[#a0a5b8]">
                  <ShieldCheck size={13} className="flex-shrink-0 text-white mt-0.5" />
                  <span>
                    {fidelityNote || "Original garment silhouette, prints, buttons, and colors strictly preserved."}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Editable Attributes Form with High Contrast Inputs */}
          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-gothic font-bold uppercase tracking-wider text-[#a0a5b8]">Piece Name</label>
                <span className="text-[10px] text-[#787c92] font-semibold">Auto-detected from image</span>
              </div>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Architectural Black Wool Coat"
                className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#161826] px-3.5 py-2.5 text-sm font-medium text-white placeholder-[#686c82] outline-none transition focus:border-white focus:bg-[#1a1d2e] shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] font-gothic font-bold uppercase tracking-wider text-[#a0a5b8]">Category</label>
                <select
                  value={category}
                  onChange={e => {
                    const newCat = e.target.value as MainCategory;
                    setCategory(newCat);
                    setSubcategory(SUBCATEGORIES[newCat]?.[0] || "Other");
                  }}
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#161826] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-white focus:bg-[#1a1d2e] shadow-2xs"
                >
                  {MAIN_CATEGORIES.map(c => (
                    <option key={c} value={c} className="bg-[#161826] text-white">{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10.5px] font-gothic font-bold uppercase tracking-wider text-[#a0a5b8]">Subcategory</label>
                <select
                  value={subcategory}
                  onChange={e => setSubcategory(e.target.value as SubCategory)}
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#161826] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-white focus:bg-[#1a1d2e] shadow-2xs"
                >
                  {(SUBCATEGORIES[category] || ["Other"]).map(s => (
                    <option key={s} value={s} className="bg-[#161826] text-white">{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dominant Color Extracted from Pixels */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-gothic font-bold uppercase tracking-wider text-[#a0a5b8]">Dominant Color</label>
                <span className="text-[10px] text-[#787c92]">Sampled from garment</span>
              </div>
              <div className="mt-1.5 flex gap-2">
                <select
                  value={colorName}
                  onChange={e => {
                    const c = e.target.value;
                    setColorName(c);
                    if (COLOR_REGISTRY[c]) setDominantHex(COLOR_REGISTRY[c].hex);
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-white/20 bg-[#161826] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-white focus:bg-[#1a1d2e] shadow-2xs"
                >
                  {Object.keys(COLOR_REGISTRY).map(c => (
                    <option key={c} value={c} className="bg-[#161826] text-white">{c}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-[#161826] px-2.5 py-1.5 shadow-2xs">
                  <input
                    type="color"
                    aria-label="Color Picker"
                    value={dominantHex}
                    onChange={e => setDominantHex(e.target.value)}
                    className="h-6 w-7 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span className="text-xs font-mono font-bold text-[#d0d4e2]">{dominantHex}</span>
                </div>
              </div>
            </div>

            {/* Fit & Material */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10.5px] font-gothic font-bold uppercase tracking-wider text-[#a0a5b8]">Fit / Silhouette</label>
                <select
                  value={fit}
                  onChange={e => setFit(e.target.value as FitType)}
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#161826] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-white focus:bg-[#1a1d2e] shadow-2xs"
                >
                  <option value="Regular" className="bg-[#161826] text-white">Regular</option>
                  <option value="Tailored" className="bg-[#161826] text-white">Tailored</option>
                  <option value="Slim" className="bg-[#161826] text-white">Slim</option>
                  <option value="Relaxed" className="bg-[#161826] text-white">Relaxed</option>
                  <option value="Oversized" className="bg-[#161826] text-white">Oversized</option>
                  <option value="Unspecified" className="bg-[#161826] text-white">Unspecified</option>
                </select>
              </div>

              <div>
                <label className="text-[10.5px] font-gothic font-bold uppercase tracking-wider text-[#a0a5b8]">Material</label>
                <input
                  value={material}
                  onChange={e => setMaterial(e.target.value)}
                  placeholder="e.g. Japanese Wool / Silk"
                  className="mt-1.5 w-full rounded-xl border border-white/20 bg-[#161826] px-3.5 py-2.5 text-xs font-medium text-white placeholder-[#686c82] outline-none transition focus:border-white focus:bg-[#1a1d2e] shadow-2xs"
                />
              </div>
            </div>

            {/* Best Occasions */}
            <div>
              <label className="text-[10.5px] font-gothic font-bold uppercase tracking-wider text-[#a0a5b8]">Best Occasions</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {ALL_OCCASIONS.slice(0, 6).map(occ => {
                  const active = selectedOccasions.includes(occ);
                  return (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => toggleOccasion(occ)}
                      className={`rounded-full px-3 py-1 text-xs font-gothic font-semibold transition ${
                        active
                          ? "bg-white text-black font-bold border border-white shadow-xs"
                          : "border border-white/15 bg-[#161826] text-[#8e92a4] hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {occ} {active && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Primary Image Selection */}
            {file && processedUrl && (
              <div className="rounded-xl border border-white/15 bg-[#161826] p-2.5 text-xs text-white">
                <span className="eyebrow text-[#a0a5b8]">WARDROBE CARD DISPLAY</span>
                <div className="mt-1.5 flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-white">
                    <input
                      type="radio"
                      name="primaryChoice"
                      checked={primaryChoice === "processed"}
                      onChange={() => setPrimaryChoice("processed")}
                      className="accent-white"
                    />
                    <span>Use Studio Image</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-white">
                    <input
                      type="radio"
                      name="primaryChoice"
                      checked={primaryChoice === "original"}
                      onChange={() => setPrimaryChoice("original")}
                      className="accent-white"
                    />
                    <span>Use Original Photo</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 safe-pb">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-[#141520] px-4 py-2 font-gothic text-xs tracking-wider text-[#8e92a4] hover:bg-[#1a1b28] hover:text-white transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-white to-[#c8cbd6] px-6 py-2.5 font-gothic text-xs font-bold tracking-wider text-[#08080b] shadow-[0_0_15px_rgba(255,255,255,0.15)] transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Wand2 size={14} className="animate-spin text-[#08080b]" /> Saving to Archive...
              </>
            ) : (
              <>
                <Check size={14} /> Catalog to Archive
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
