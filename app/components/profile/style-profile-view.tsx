"use client";

import React, { useState } from "react";
import { User, CloudSun, Check, Sparkles, Sliders } from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";

const STYLE_ARCHETYPES = [
  "Haute Gothic",
  "Architectural Minimalist",
  "Tailored Chic",
  "Opulencia Noire",
  "Classic Menswear",
  "Smart Casual",
  "Contemporary Avant-Garde",
  "Capsule Wardrobe",
  "Monochrome Modern"
];

const FIT_OPTIONS = ["Regular", "Tailored", "Slim", "Relaxed", "Oversized"];

export function StyleProfileView() {
  const { profile, updateProfile, refreshWeather } = useWardrobe();

  const [name, setName] = useState(profile.displayName || "");
  const [city, setCity] = useState(profile.city || "New York");
  const [weatherEnabled, setWeatherEnabled] = useState(profile.enableWeatherStyling);
  const [selectedStyles, setSelectedStyles] = useState<string[]>(profile.stylePreferences || []);
  const [selectedFits, setSelectedFits] = useState<string[]>(profile.fitPreferences || []);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleStyle = (style: string) => {
    setSelectedStyles(curr =>
      curr.includes(style) ? curr.filter(s => s !== style) : [...curr, style]
    );
  };

  const toggleFit = (fit: string) => {
    setSelectedFits(curr =>
      curr.includes(fit) ? curr.filter(f => f !== fit) : [...curr, fit]
    );
  };

  const handleSave = async () => {
    updateProfile({
      displayName: name.trim() || profile.displayName,
      city: city.trim() || profile.city,
      enableWeatherStyling: weatherEnabled,
      stylePreferences: selectedStyles,
      fitPreferences: selectedFits
    });
    await refreshWeather();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="eyebrow text-[#585c6e]">PERSONAL STYLE IDENTITY &bull; ATELIER CIPHER</div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">Style Profile</h1>
        <p className="mt-1 font-editorial italic text-sm text-[#484c5c]">
          Define your aesthetic foundation. These parameters guide how our deterministic engine curates silhouettes for you.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#0a0b10]/20 bg-white/90 px-4 py-3 text-xs font-gothic font-bold text-[#0a0b10] shadow-md">
          <Check size={15} />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Account Info */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#0a0b10]">Identity & Location</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="eyebrow text-[#585c6e]">Preferred Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#bcc0ce] bg-[#f4f6fa] px-3.5 py-2.5 font-gothic text-sm font-bold text-[#0a0b10] outline-none focus:border-[#0a0b10]"
            />
          </div>

          <div>
            <label className="eyebrow text-[#585c6e]">City (Weather-Aware Styling)</label>
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. New York, London, Paris"
              className="mt-1.5 w-full rounded-xl border border-[#bcc0ce] bg-[#f4f6fa] px-3.5 py-2.5 font-gothic text-sm font-bold text-[#0a0b10] outline-none focus:border-[#0a0b10]"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#bcc0ce] bg-[#f4f6fa] p-3.5">
          <div className="flex items-center gap-2.5">
            <CloudSun size={18} className="text-[#0a0b10]" />
            <div>
              <div className="font-gothic text-xs font-bold uppercase tracking-wider text-[#0a0b10]">Live Climate & Temperature Layering</div>
              <div className="font-editorial italic text-xs text-[#585c6e]">
                Automatically incorporates local temperature and atmosphere forecasts into recommendations.
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={weatherEnabled}
            onChange={e => setWeatherEnabled(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-[#0a0b10]"
          />
        </div>
      </div>

      {/* Style Archetypes */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#0a0b10]">Style Archetypes</h2>
        <p className="mt-1 font-editorial italic text-xs text-[#585c6e]">
          Select the aesthetics that inspire your digital wardrobe.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {STYLE_ARCHETYPES.map(style => {
            const active = selectedStyles.includes(style);
            return (
              <button
                key={style}
                onClick={() => toggleStyle(style)}
                className={`rounded-full px-4 py-2 font-gothic text-xs uppercase tracking-wider transition ${
                  active
                    ? "bg-[#0a0b10] text-white font-bold shadow-xs border border-[#0a0b10]"
                    : "border border-[#bcc0ce] bg-white text-[#424656] font-semibold hover:border-[#8e93a6] hover:bg-[#f8f9fc]"
                }`}
              >
                {style} {active && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fit Preferences */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#0a0b10]">Preferred Garment Cuts</h2>
        <p className="mt-1 font-editorial italic text-xs text-[#585c6e]">
          Silhouettes you prefer wearing.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {FIT_OPTIONS.map(fit => {
            const active = selectedFits.includes(fit);
            return (
              <button
                key={fit}
                onClick={() => toggleFit(fit)}
                className={`rounded-full px-4 py-2 font-gothic text-xs uppercase tracking-wider transition ${
                  active
                    ? "bg-[#0a0b10] text-white font-bold shadow-xs border border-[#0a0b10]"
                    : "border border-[#bcc0ce] bg-white text-[#424656] font-semibold hover:border-[#8e93a6] hover:bg-[#f8f9fc]"
                }`}
              >
                {fit} {active && "✓"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="gothic-enamel-btn flex items-center gap-2"
        >
          <Check size={14} />
          <span>Save Style Profile</span>
        </button>
      </div>
    </div>
  );
}
