"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Database, ShieldCheck, Download, RefreshCw, Key, LogOut, Check, AlertCircle, Sparkles, ExternalLink
} from "lucide-react";
import { useWardrobe } from "../../../lib/store/wardrobe-context";

export function SettingsView({ onOpenAuth }: { onOpenAuth?: () => void }) {
  const {
    isSupabaseConnected,
    isAuthenticated,
    userEmail,
    signOut,
    resetWardrobe,
    items,
    savedOutfits
  } = useWardrobe();

  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (confirm("Reset wardrobe to original starter capsule items? This will clear custom uploads and custom saved outfits.")) {
      resetWardrobe();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleExportData = () => {
    window.location.href = "/api/user/export";
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <div className="eyebrow text-[#585c6e]">PREFERENCES &bull; ATELIER ARCHIVE INFRASTRUCTURE</div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-gothic font-bold uppercase tracking-[0.16em] text-[#090a10]">Settings & Account</h1>
        <p className="mt-1 font-editorial italic text-sm text-[#484c5c]">
          Manage your cloud connectivity, privacy preferences, and digital couture archive backups.
        </p>
      </div>

      {resetSuccess && (
        <div className="flex items-center gap-2 rounded-2xl border border-[#0a0b10]/20 bg-white/90 px-4 py-3 text-xs font-gothic font-bold text-[#0a0b10] shadow-md">
          <Check size={15} />
          <span>Wardrobe reset to curated starter items.</span>
        </div>
      )}

      {/* Account State */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-[#bcc0ce]/50 pb-4">
          <div>
            <h2 className="font-gothic text-base font-bold uppercase tracking-wider text-[#0a0b10]">Authentication & Account</h2>
            <p className="mt-0.5 font-editorial italic text-xs text-[#585c6e]">
              {isAuthenticated ? `Signed in as ${userEmail}` : "Using guest session"}
            </p>
          </div>

          {isAuthenticated ? (
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-full border border-[#bcc0ce] bg-white px-4 py-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#0a0b10] hover:bg-[#0a0b10] hover:text-white shadow-2xs transition"
            >
              <LogOut size={13} /> Sign out
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="gothic-enamel-btn !py-2 !px-4 !text-xs"
              >
                Sign In
              </button>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#bcc0ce] bg-white px-3.5 py-2 text-xs font-gothic tracking-wider text-[#0a0b10] font-bold hover:bg-[#f2f4fa] transition shadow-2xs"
              >
                <span>Full Page</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs font-gothic">
          <span className="text-[#585c6e]">Active Wardrobe Pieces:</span>
          <span className="font-bold text-[#0a0b10]">{items.length} items</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs font-gothic">
          <span className="text-[#585c6e]">Saved Outfits:</span>
          <span className="font-bold text-[#0a0b10]">{savedOutfits.length} looks</span>
        </div>
      </div>

      {/* Database Connection Status */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a0b10] text-white shadow-xs">
              <Database size={18} />
            </div>
            <div>
              <h2 className="font-gothic text-sm font-bold uppercase tracking-wider text-[#0a0b10]">Supabase Cloud Database</h2>
              <p className="font-editorial italic text-xs text-[#585c6e]">
                {isSupabaseConnected
                  ? "Connected & Live (PostgreSQL + RLS enabled)"
                  : "Development Mode (Local persistence active with localStorage & in-memory cache)"}
              </p>
            </div>
          </div>

          <span className="rounded-full border border-[#bcc0ce] bg-white px-3 py-1 font-gothic text-[10px] font-bold tracking-widest uppercase text-[#0a0b10] shadow-2xs">
            {isSupabaseConnected ? "CONNECTED" : "DEV PERSISTENCE"}
          </span>
        </div>

        {!isSupabaseConnected && (
          <div className="mt-4 rounded-xl border border-[#bcc0ce] bg-[#f4f6fa] p-3 text-xs leading-5 text-[#484c5c]">
            <span className="font-gothic font-bold text-[#0a0b10] uppercase tracking-wider">To connect your Supabase project:</span>
            <br />
            Add <code className="rounded bg-white px-1.5 py-0.5 border border-[#bcc0ce] font-mono font-bold text-[#0a0b10]">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="rounded bg-white px-1.5 py-0.5 border border-[#bcc0ce] font-mono font-bold text-[#0a0b10]">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="rounded bg-white px-1.5 py-0.5 border border-[#bcc0ce] font-mono">.env.local</code>. Run the SQL migration in <code className="rounded bg-white px-1.5 py-0.5 border border-[#bcc0ce] font-mono">supabase/migrations/</code> to create tables.
          </div>
        )}
      </div>

      {/* Privacy & Security */}
      <div className="rounded-[24px] border border-[#bcc0ce] bg-white/95 p-6 shadow-sm">
        <div className="flex items-center gap-2 font-gothic font-bold uppercase tracking-wider text-[#0a0b10]">
          <ShieldCheck size={18} className="text-[#0a0b10]" />
          <span>Privacy & Data Sovereignty</span>
        </div>
        <p className="mt-2 font-editorial italic text-xs leading-5 text-[#484c5c]">
          Wardrobe photographs and style profiles belong strictly to you. In production, image uploads are stored in private storage buckets with short-lived signed URLs. Client applications never receive service-role credentials.
        </p>

        <div className="mt-5 flex flex-wrap gap-3 border-t border-[#bcc0ce]/50 pt-4">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 rounded-full border border-[#bcc0ce] bg-white px-4 py-2 font-gothic text-xs font-bold uppercase tracking-wider text-[#0a0b10] hover:bg-[#0a0b10] hover:text-white transition shadow-2xs"
          >
            <Download size={14} /> Export Wardrobe Data (JSON)
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 font-gothic text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50 transition shadow-2xs"
          >
            <RefreshCw size={14} /> Reset Wardrobe to Starter
          </button>
        </div>
      </div>
    </div>
  );
}
