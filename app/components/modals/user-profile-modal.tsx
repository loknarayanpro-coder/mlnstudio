"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  User,
  Mail,
  MapPin,
  ShieldCheck,
  LogOut,
  Sliders,
  Check,
  Edit2,
  Sparkles,
  Layers,
  Heart
} from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const {
    profile,
    updateProfile,
    userEmail,
    items,
    savedOutfits,
    signOut,
    setActiveTab
  } = useWardrobe();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [city, setCity] = useState(profile.city || "New York");
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const currentEmail = userEmail || profile.email || "loknarayanmagesh@gmail.com";
  const initials = (profile.displayName || currentEmail.split("@")[0] || "LO")
    .slice(0, 2)
    .toUpperCase();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      displayName: displayName.trim() || profile.displayName,
      city: city.trim() || profile.city
    });
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSignOut = async () => {
    onClose();
    await signOut();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md selection:bg-[#0a0b10] selection:text-white"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-[28px] border border-white/10 bg-[#0d0e15] text-white p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-white/5 blur-3xl" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-32 sm:h-10 sm:w-36">
              <Image
                src="/brand/mln-studio-black.png"
                alt="MLN STUDIO"
                fill
                priority
                className="object-contain object-left invert"
              />
            </div>
            <span className="hidden sm:inline-block h-3 w-px bg-white/20" />
            <span className="hidden sm:inline-block eyebrow text-[#8e92a4]">USER DETAILS</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-white/15 bg-[#161826] p-2 text-[#8e92a4] hover:bg-[#202334] hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <Check size={14} className="text-emerald-400" />
            <span>Profile details updated successfully.</span>
          </div>
        )}

        {/* User Monogram & Identity Card */}
        <div className="mt-5 rounded-2xl border border-white/10 bg-[#141624] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-br from-[#1c1f32] to-[#0a0b12] font-gothic text-xl font-bold text-white shadow-md">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-gothic text-lg sm:text-xl font-bold uppercase tracking-wider text-white">
                  {profile.displayName || currentEmail.split("@")[0]}
                </h3>
                <span className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-gothic font-bold uppercase tracking-widest text-white">
                  <ShieldCheck size={10} className="text-white" />
                  Verified
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-[#8e92a4]">
                <Mail size={12} className="shrink-0 text-[#8e92a4]" />
                <span className="truncate">{currentEmail}</span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-[#8e92a4]">
                <MapPin size={12} className="shrink-0 text-[#8e92a4]" />
                <span className="font-editorial italic">{profile.city || "Sanctuary / New York"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Archive Metrics Overview */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-white/10 bg-[#141624] p-3 text-center">
            <div className="eyebrow text-[#8e92a4]">CREATIONS</div>
            <div className="mt-1 font-gothic text-xl font-bold text-white">
              {String(items.length).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-[#6a6e82]">in wardrobe</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141624] p-3 text-center">
            <div className="eyebrow text-[#8e92a4]">SAVED LOOKS</div>
            <div className="mt-1 font-gothic text-xl font-bold text-white">
              {String(savedOutfits.length).padStart(2, "0")}
            </div>
            <div className="text-[10px] text-[#6a6e82]">in lookbook</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#141624] p-3 text-center">
            <div className="eyebrow text-[#8e92a4]">ATELIER TIER</div>
            <div className="mt-1 font-gothic text-xs font-bold text-white tracking-wider uppercase">
              Noire
            </div>
            <div className="text-[10px] text-[#6a6e82]">Haute Member</div>
          </div>
        </div>

        {/* Profile Settings / Edit Form */}
        <div className="mt-5">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-3 rounded-2xl border border-white/15 bg-[#141624] p-4">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="eyebrow text-[#8e92a4]">EDIT ATELIER PROFILE</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-[#8e92a4] hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[10px] font-gothic font-bold uppercase tracking-wider text-[#8e92a4]">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-[#1a1c2e] px-3.5 py-2 font-gothic text-sm text-white outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-gothic font-bold uppercase tracking-wider text-[#8e92a4]">
                  City (for Climate-Aware Styling)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/20 bg-[#1a1c2e] px-3.5 py-2 font-gothic text-sm text-white outline-none focus:border-white"
                />
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-gothic text-xs font-bold uppercase tracking-wider text-black hover:bg-[#e2e5ee] transition"
                >
                  <Check size={13} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setDisplayName(profile.displayName || "");
                  setCity(profile.city || "New York");
                  setIsEditing(true);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#141624] px-4 py-3 font-gothic text-xs font-semibold text-white hover:border-white/30 hover:bg-[#1a1d30] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Edit2 size={14} className="text-[#8e92a4]" />
                  <span>Edit Profile & Location</span>
                </div>
                <span className="text-xs text-[#8e92a4]">Modify ↗</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("Style profile");
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#141624] px-4 py-3 font-gothic text-xs font-semibold text-white hover:border-white/30 hover:bg-[#1a1d30] transition"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders size={14} className="text-[#8e92a4]" />
                  <span>Aesthetic & Cut Preferences</span>
                </div>
                <span className="text-xs text-[#8e92a4]">Tune ↗</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer with Sign Out */}
        <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/15 bg-[#141522] px-4 py-2 font-gothic text-xs tracking-wider text-[#8e92a4] hover:bg-[#1c1e2e] hover:text-white transition"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/20 px-4 py-2 font-gothic text-xs font-bold uppercase tracking-wider text-rose-300 hover:bg-rose-900/40 transition"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
