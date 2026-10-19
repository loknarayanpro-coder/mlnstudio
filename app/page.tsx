"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shirt, LayoutDashboard, Sparkles, Layers3, CalendarDays, Heart, Settings,
  Search, Plus, Bell, ChevronDown, ArrowUpRight, SlidersHorizontal, Upload,
  Check, WandSparkles, Footprints, Watch, Palette, X, ImagePlus, Trash2,
  RefreshCw, Menu, Sun, CloudSun, CloudRain, BriefcaseBusiness, TrendingUp, Sliders,
  Crown, Compass, Moon
} from "lucide-react";
import { WardrobeProvider, useWardrobe } from "../lib/store/wardrobe-context";
import { MainCategory, WardrobeItem } from "../lib/types/wardrobe";
import { GarmentIllustration } from "./components/ui/garment-illustration";
import { AddClothingModal } from "./components/modals/add-clothing-modal";
import { ItemDetailModal } from "./components/modals/item-detail-modal";
import { UserProfileModal } from "./components/modals/user-profile-modal";
import { StylistView } from "./components/stylist/stylist-view";
import { PlannerView } from "./components/planner/planner-view";
import { SavedOutfitsView } from "./components/outfits/saved-outfits-view";
import { ColorPreferencesView } from "./components/profile/color-preferences-view";
import { StyleProfileView } from "./components/profile/style-profile-view";
import { WearHistoryView } from "./components/analytics/wear-history-view";
import { SettingsView } from "./components/settings/settings-view";
import { GothicLandingView } from "./components/landing/gothic-landing-view";

const CATEGORIES: Array<"All" | MainCategory> = [
  "All",
  "Tops",
  "Bottoms",
  "Dresses & One-Pieces",
  "Outerwear",
  "Footwear",
  "Watches",
  "Bags",
  "Accessories"
];

const NAVIGATION_ITEMS = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "My wardrobe", icon: Layers3 },
  { label: "AI stylist", icon: Sparkles },
  { label: "Outfit planner", icon: CalendarDays },
  { label: "Saved outfits", icon: Heart },
  { label: "Wear history", icon: TrendingUp },
  { label: "Color preferences", icon: Palette },
  { label: "Style profile", icon: Sliders },
  { label: "Settings", icon: Settings }
];

function WardrobeApp() {
  const {
    items,
    recommendations,
    savedOutfits,
    weather,
    profile,
    activeTab,
    setActiveTab,
    toggleFavorite,
    deleteItem,
    bulkDeleteItems,
    resetWardrobe,
    isAuthenticated,
    isInitialized,
    signIn
  } = useWardrobe();

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState<WardrobeItem | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stylistAnchorId, setStylistAnchorId] = useState<string | undefined>(undefined);

  // Wardrobe Grid Controls
  const [activeCategory, setActiveCategory] = useState<"All" | MainCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "wearCount" | "name">("recent");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMode, setBulkMode] = useState(false);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items
      .filter(item => {
        if (activeCategory !== "All" && item.category !== activeCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            item.name.toLowerCase().includes(q) ||
            item.colorName.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.subcategory.toLowerCase().includes(q) ||
            (item.attributes.material && item.attributes.material.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "wearCount") return b.wearCount - a.wearCount;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [items, activeCategory, searchQuery, sortBy]);

  const handleBuildOutfitAround = (itemId: string) => {
    setStylistAnchorId(itemId);
    setActiveTab("AI stylist");
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(curr => (curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]));
  };

  const handleBulkDelete = () => {
    if (confirm(`Remove ${selectedIds.length} creations from your archive?`)) {
      bulkDeleteItems(selectedIds);
      setSelectedIds([]);
      setBulkMode(false);
    }
  };

  if (!isAuthenticated) {
    return <GothicLandingView />;
  }

  return (
    <div className="shell flex bg-[#d8dbe5] text-[#0a0b10]">
      {/* Desktop Sidebar Navigation */}
      <aside className="sidebar hidden flex-col border-r border-[#b8bcc8] bg-[#d5d8e2] px-5 py-6 text-[#0a0b10] md:flex">
        {/* MLN Studio Gothic Logo Brand Header */}
        <div className="mb-7 flex flex-col items-center px-1">
          <Link href="/" className="relative w-full h-14 block">
            <Image
              src="/brand/mln-studio-black.png"
              alt="MLN STUDIO"
              fill
              priority
              className="object-contain"
            />
          </Link>
          <div className="eyebrow mt-1 text-[8.5px] text-[#484c5c] tracking-[0.28em] text-center font-bold">
            ATELIER NOIRE · HAUTE COUTURE
          </div>
        </div>

        {/* Quick Add Piece CTA */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a0b10] py-2.5 text-xs font-gothic font-bold tracking-wider text-white shadow-md hover:bg-[#1a1c26] active:scale-[0.99] transition"
        >
          <Plus size={15} />
          <span className="nav-label">Add Clothing Piece</span>
        </button>

        {/* Navigation Links */}
        <div className="sidebar-section eyebrow mb-2 px-3 text-[#525666] font-bold">Closet Workspace</div>
        <nav className="flex flex-col gap-1">
          {NAVIGATION_ITEMS.slice(0, 5).map(nav => {
            const Icon = nav.icon;
            const active = activeTab === nav.label;
            return (
              <button
                key={nav.label}
                onClick={() => setActiveTab(nav.label)}
                className={`navitem ${active ? "active" : "text-[#383c4c] hover:bg-black/5"}`}
              >
                <Icon size={16} />
                <span className="nav-label text-[12.5px]">{nav.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-section eyebrow mb-2 mt-7 px-3 text-[#525666] font-bold">Style & Preferences</div>
        <nav className="flex flex-col gap-1">
          {NAVIGATION_ITEMS.slice(5).map(nav => {
            const Icon = nav.icon;
            const active = activeTab === nav.label;
            return (
              <button
                key={nav.label}
                onClick={() => setActiveTab(nav.label)}
                className={`navitem ${active ? "active" : "text-[#383c4c] hover:bg-black/5"}`}
              >
                <Icon size={16} />
                <span className="nav-label text-[12.5px]">{nav.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div
          onClick={() => setIsProfileModalOpen(true)}
          className="mt-auto flex cursor-pointer items-center gap-3 border-t border-[#b8bcc8] pt-4 transition hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b8bcc8] bg-white text-xs font-gothic font-bold text-[#0a0b10] shadow-xs">
            {profile.displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="brand-name min-w-0">
            <div className="truncate text-xs font-gothic font-bold text-[#0a0b10] tracking-wide">{profile.displayName}</div>
            <div className="text-[10px] text-[#525666] font-editorial italic font-semibold">{profile.city || "Sanctuary"}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Shell */}
      <main className="main flex flex-1 flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#bcc0ce] bg-[#eaedf5]/95 px-4 backdrop-blur-md sm:h-[76px] sm:px-8 lg:px-10">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#bcc0ce] bg-white text-[#0a0b10] md:hidden shadow-2xs"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-3">
              <Link href="/" className="relative h-9 w-36 md:hidden block">
                <Image
                  src="/brand/mln-studio-black.png"
                  alt="MLN STUDIO"
                  fill
                  priority
                  className="object-contain object-left"
                />
              </Link>
              <div className="hidden md:block">
                <div className="eyebrow text-[#585c6e]" suppressHydrationWarning>
                  {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toUpperCase()}
                </div>
                <div className="text-sm font-gothic font-bold text-[#0a0b10] sm:text-base tracking-[0.16em]">
                  {activeTab === "Overview" ? "Dashboard" : activeTab}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick Add Button in Header */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="hidden items-center gap-1.5 rounded-full bg-[#0a0b10] px-4 py-2 text-xs font-gothic font-bold tracking-wider text-white shadow-xs hover:bg-[#1c1e28] transition sm:flex"
            >
              <Plus size={14} />
              <span>Add Piece</span>
            </button>

            {/* Account Avatar */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-[#bcc0ce] bg-white p-1 pr-2 hover:bg-[#f4f6fa] shadow-2xs transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0a0b10] border border-[#1a1c26] text-[11px] font-gothic font-bold text-white">
                {profile.displayName.slice(0, 2).toUpperCase()}
              </div>
              <ChevronDown size={13} className="text-[#585c6e]" />
            </button>
          </div>
        </header>

        {/* Content Body Area */}
        <div className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 pb-28 sm:px-8 sm:py-7 sm:pb-12 lg:px-10 lg:py-9">
          {/* 1. OVERVIEW / DASHBOARD (OPULENCIA SILVER MIST CONTRAST) */}
          {activeTab === "Overview" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Opulencia / Haute Archive Hero Banner */}
              <section className="gothic-hero rounded-[24px] p-6 sm:p-9 lg:p-12">
                <div className="relative z-10 max-w-[620px]">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-[10px] text-[#0a0b10] font-gothic tracking-[0.28em] uppercase font-bold">✦ ATELIER NOIRE</span>
                    <span className="h-px w-6 bg-[#0a0b10]/40" />
                    <span className="text-[10px] text-[#525666] font-gothic tracking-[0.24em] uppercase font-semibold">VOL. I</span>
                  </div>

                  <h1 className="font-gothic text-3xl font-bold leading-[1.1] tracking-[0.18em] text-[#090a10] sm:text-5xl lg:text-6xl uppercase">
                    HAUTE ARCHIVE
                  </h1>

                  <div className="mt-2 text-sm sm:text-base font-gothic tracking-[0.16em] text-[#1c1e28] uppercase font-bold">
                    Silence as Luxury &bull; Architectural Style
                  </div>

                  <p className="font-editorial italic text-base leading-6 text-[#383b4c] mt-3.5 max-w-[500px]">
                    Inspired by darkness, minimalism, and timeless tailoring, each piece in your digital wardrobe is curated to be more than a garment — it is an architectural statement of mood, form, and confidence.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab("AI stylist")}
                      className="gothic-enamel-btn"
                    >
                      <Sparkles size={13} className="text-white" />
                      <span>Explore Outfits</span>
                      <ArrowUpRight size={13} />
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="secondary inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Catalog Garment</span>
                    </button>
                  </div>
                </div>

                {/* Decorative Gothic Rose & Graphic Element */}
                <div className="pointer-events-none absolute -right-6 -top-4 hidden h-[340px] w-[390px] items-center justify-center opacity-95 lg:flex">
                  <div className="absolute h-64 w-64 rounded-full border border-[#bcc0ce]" />
                  <div className="absolute h-48 w-48 rounded-full border border-[#a2a6b6]/60" />
                  <div className="relative rotate-[-2deg] flex items-center justify-center w-[240px] h-[280px]">
                    <GarmentIllustration item={null} large />
                  </div>
                  <div className="absolute bottom-6 right-10 rounded-2xl border border-[#b8bcc8] bg-white/95 p-3.5 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#0a0b10] animate-pulse" />
                      <span className="font-gothic text-xs font-bold tracking-wider text-[#0a0b10]">Color Harmony Active</span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {["#0a0b10", "#2c2e3a", "#787c8c", "#d0d4de", "#ffffff"].map(c => (
                        <span key={c} className="h-4 w-4 rounded-full border border-black/20" style={{ background: c }} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Summary Metric Cards */}
              <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                {[
                  { label: "PIECES", value: String(items.length).padStart(2, "0"), sub: "In collection", icon: Layers3 },
                  { label: "OUTFITS", value: String(recommendations.length).padStart(2, "0"), sub: "Ready to wear", icon: Sparkles },
                  { label: "SAVED LOOKS", value: String(savedOutfits.length).padStart(2, "0"), sub: "In lookbook", icon: Heart },
                  { label: "FAVORITES", value: String(items.filter(i => i.favorite).length).padStart(2, "0"), sub: "Essentials", icon: Shirt }
                ].map(metric => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="gothic-card p-4 sm:p-5"
                    >
                      <div className="flex items-center justify-between text-[#525666]">
                        <span className="font-gothic text-[9.5px] sm:text-[10px] tracking-[0.2em] uppercase font-bold text-[#525666]">
                          {metric.label}
                        </span>
                        <Icon size={15} className="text-[#0a0b10]" />
                      </div>
                      <div className="mt-2 font-gothic text-2xl sm:text-3xl font-bold tracking-wider text-[#0a0b10]">
                        {metric.value}
                      </div>
                      <div className="mt-1 font-editorial italic text-xs text-[#505466]">{metric.sub}</div>
                    </div>
                  );
                })}
              </section>

              {/* Two-Column Showcase: NEW ARRIVALS & COLLECTIONS */}
              <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
                {/* Outfit Highlights - Styled as NEW ARRIVALS */}
                <div>
                  <div className="mb-4 flex items-end justify-between border-b border-[#b8bcc8] pb-2.5">
                    <div>
                      <div className="eyebrow text-[#585c6e] text-[9.5px]">CURATED COMBINATIONS</div>
                      <h2 className="font-gothic text-lg sm:text-xl font-bold tracking-[0.16em] text-[#0a0b10] uppercase mt-0.5">
                        NEW ARRIVALS
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("AI stylist")}
                      className="font-gothic text-xs tracking-wider text-[#1a1c24] hover:text-black transition flex items-center gap-1 font-bold"
                    >
                      <span>VIEW ALL ({recommendations.length})</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>

                  {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#b8bcc8] bg-white/80 p-8 text-center shadow-xs sm:col-span-2">
                      <div className="relative mb-2">
                        <Moon size={26} className="text-[#0a0b10]" />
                      </div>
                      <div className="font-gothic text-xs font-bold tracking-widest text-[#0a0b10] uppercase mt-2">
                        Sanctuary Awaits Its First Piece
                      </div>
                      <p className="font-editorial italic text-xs text-[#4a4e5e] mt-1 max-w-sm">
                        Catalog tops and bottoms to awaken intelligent haute couture combinations.
                      </p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 gothic-enamel-btn"
                      >
                        <Plus size={13} /> Add Piece
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-3.5 sm:grid-cols-2">
                      {recommendations.slice(0, 2).map(rec => (
                        <div
                          key={rec.id}
                          className="flex flex-col overflow-hidden rounded-[20px] border border-[#c2c6d2] bg-white shadow-sm hover:border-[#8e92a4] transition"
                        >
                          <div className="relative flex h-[165px] items-center justify-center gap-1.5 bg-gradient-to-b from-[#f2f4fa] to-[#e4e7f0] p-3 sm:h-[180px] border-b border-[#d8dbe4]">
                            {rec.items.slice(0, 3).map(piece => (
                              <div key={piece.id} className="flex h-[120px] sm:h-[135px] flex-1 items-center justify-center rounded-xl bg-white shadow-2xs border border-[#c2c6d2]">
                                <GarmentIllustration item={piece} />
                              </div>
                            ))}
                            <span className="tag absolute left-2.5 top-2.5">
                              {rec.vibe}
                            </span>
                            <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#0a0b10] px-2.5 py-0.5 text-[10px] font-gothic font-bold text-white shadow-xs">
                              <Sparkles size={9} /> {rec.score.totalScore}%
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                            <h3 className="font-gothic font-bold text-[#0a0b10] text-xs sm:text-sm tracking-wide">{rec.title}</h3>
                            <p className="font-editorial italic text-xs text-[#505466] mt-1 line-clamp-2">{rec.explanation}</p>
                            <button
                              onClick={() => setActiveTab("AI stylist")}
                              className="mt-auto pt-2.5 text-left font-gothic text-xs tracking-wider text-[#0a0b10] font-bold hover:underline"
                            >
                              Explore Combination &rarr;
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recently Added Pieces - Styled as COLLECTIONS */}
                <div>
                  <div className="mb-4 flex items-end justify-between border-b border-[#b8bcc8] pb-2.5">
                    <div>
                      <div className="eyebrow text-[#585c6e] text-[9.5px]">HAUTE ARCHIVE</div>
                      <h2 className="font-gothic text-lg sm:text-xl font-bold tracking-[0.16em] text-[#0a0b10] uppercase mt-0.5">
                        COLLECTIONS
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("My wardrobe")}
                      className="font-gothic text-xs tracking-wider text-[#1a1c24] hover:text-black transition font-bold"
                    >
                      ALL PIECES &nearr;
                    </button>
                  </div>

                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#b8bcc8] bg-white/80 p-8 text-center shadow-xs">
                      <Shirt size={24} className="text-[#0a0b10]" />
                      <div className="font-gothic text-xs font-bold tracking-widest text-[#0a0b10] uppercase mt-2">
                        0 Pieces in Archive
                      </div>
                      <p className="font-editorial italic text-xs text-[#4a4e5e] mt-1">
                        Upload any clothing photograph to transform it into studio catalog presentation.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e2e5ee] rounded-[20px] border border-[#c2c6d2] bg-white shadow-sm">
                      {items.slice(0, 4).map(piece => (
                        <div
                          key={piece.id}
                          onClick={() => setInspectedItem(piece)}
                          className="flex cursor-pointer items-center gap-3 p-2.5 sm:p-3 transition hover:bg-[#f4f6fb]"
                        >
                          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-[#f0f2f8] border border-[#c2c6d2]">
                            <GarmentIllustration item={piece} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-gothic text-xs font-bold text-[#0a0b10] tracking-wide">{piece.name}</div>
                            <div className="mt-0.5 font-editorial italic text-[11px] text-[#525666]">
                              {piece.category} &bull; {piece.colorName}
                            </div>
                          </div>
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/20"
                            style={{ background: piece.dominantHex }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* WHY NOIRE Signature Quote Banner */}
              <section className="relative rounded-2xl border border-[#bcc0ce] bg-gradient-to-r from-[#eef1f8] via-[#ffffff] to-[#eef1f8] p-6 text-center shadow-sm">
                <div className="filigree-divider mb-2">
                  <span className="text-[#0a0b10] font-gothic text-xs tracking-widest font-bold">&diams; WHY NOIRE &diams;</span>
                </div>
                <p className="font-editorial italic text-base sm:text-lg text-[#1a1c26] max-w-2xl mx-auto">
                  &ldquo;Silence is the highest form of luxury. In the shadows of intentional craft, personal style transcends time.&rdquo;
                </p>
                <div className="mt-2 font-gothic text-[10px] tracking-[0.25em] text-[#55596a] uppercase font-bold">
                  MLN STUDIO &bull; ARCHIVAL CODE
                </div>
              </section>
            </div>
          )}

          {/* 2. MY WARDROBE SECTION */}
          {activeTab === "My wardrobe" && (
            <div className="space-y-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end border-b border-[#b8bcc8] pb-4">
                <div>
                  <div className="eyebrow text-[#585c6e]">PERSONAL ATELIER</div>
                  <h1 className="mt-0.5 font-gothic text-2xl sm:text-3xl font-bold tracking-[0.14em] text-[#0a0b10] uppercase">
                    My Wardrobe
                  </h1>
                  <p className="mt-1 font-editorial italic text-xs sm:text-sm text-[#525666]">
                    {items.length} creations cataloged into studio catalog presentation.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {items.length > 0 && (
                    <button
                      onClick={() => {
                        if (confirm("Remove every piece from your wardrobe?")) {
                          resetWardrobe();
                        }
                      }}
                      className="rounded-full border border-rose-300 bg-rose-50 px-3.5 py-1.5 font-gothic text-xs text-rose-800 hover:bg-rose-100 transition"
                      title="Remove every piece from your archive"
                    >
                      Clear All ({items.length})
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setBulkMode(!bulkMode);
                      setSelectedIds([]);
                    }}
                    className={`rounded-full border px-3.5 py-1.5 font-gothic text-xs tracking-wider transition ${
                      bulkMode ? "border-[#0a0b10] bg-[#0a0b10] text-white font-bold" : "border-[#bcc0ce] bg-white text-[#0a0b10] hover:bg-[#f0f2f8]"
                    }`}
                  >
                    {bulkMode ? "Done" : "Select"}
                  </button>

                  {bulkMode && selectedIds.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 rounded-full bg-red-800 px-3.5 py-1.5 font-gothic text-xs font-bold tracking-wider text-white shadow-md hover:bg-red-700 transition"
                    >
                      <Trash2 size={12} /> Remove ({selectedIds.length})
                    </button>
                  )}

                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="gothic-enamel-btn"
                  >
                    <Plus size={14} /> Add Piece
                  </button>
                </div>
              </div>

              {/* Search & Horizontal Swipeable Category Bar */}
              <div className="rounded-[20px] border border-[#c2c6d2] bg-white p-3 sm:p-4 shadow-sm space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#727686]" />
                    <input
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search creations, colors, textiles..."
                      className="w-full rounded-full border border-[#c2c6d2] bg-[#f2f4fa] py-2 pl-9 pr-3 text-xs text-[#0a0b10] placeholder-[#727686] outline-none transition focus:border-[#0a0b10] focus:bg-white"
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    aria-label="Sort pieces"
                    className="rounded-full border border-[#c2c6d2] bg-[#f2f4fa] px-3.5 py-2 font-gothic text-xs text-[#0a0b10] outline-none"
                  >
                    <option value="recent">Recent</option>
                    <option value="wearCount">Most Worn</option>
                    <option value="name">Name</option>
                  </select>
                </div>

                {/* Horizontal Swipeable Category Scroller */}
                <div className="no-scrollbar flex flex-nowrap items-center gap-1.5 overflow-x-auto border-t border-[#e2e5ee] pt-2.5">
                  {CATEGORIES.map(c => {
                    const active = activeCategory === c;
                    return (
                      <button
                        key={c}
                        onClick={() => setActiveCategory(c)}
                        className={`flex-shrink-0 rounded-full px-3.5 py-1.5 font-gothic text-xs tracking-wider transition ${
                          active
                            ? "bg-[#0a0b10] text-white font-bold shadow-sm"
                            : "bg-[#f0f2f8] text-[#525666] border border-[#d2d6e2] hover:bg-white hover:text-black"
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wardrobe Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredItems.map(piece => {
                  const selected = selectedIds.includes(piece.id);

                  return (
                    <div
                      key={piece.id}
                      className={`closet-card group relative flex flex-col ${
                        selected ? "border-[#0a0b10] ring-2 ring-[#0a0b10]" : ""
                      }`}
                    >
                      {/* Photo Container */}
                      <div
                        onClick={() => {
                          if (bulkMode) handleToggleSelect(piece.id);
                          else setInspectedItem(piece);
                        }}
                        className="closet-photo cursor-pointer transition group-hover:brightness-95"
                      >
                        <GarmentIllustration item={piece} />

                        {/* Category Tag */}
                        <span className="tag absolute left-2 top-2 bg-[#0a0b10] text-white">
                          {piece.subcategory || piece.category}
                        </span>

                        {/* Quick Action buttons */}
                        {!bulkMode && (
                          <div className="absolute right-2 top-2 flex items-center gap-1.5">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                deleteItem(piece.id);
                              }}
                              aria-label="Delete piece"
                              className="rounded-full border border-rose-300 bg-white/90 p-1.5 shadow-2xs transition hover:bg-rose-950 hover:text-white active:scale-90"
                              title="Delete piece"
                            >
                              <Trash2 size={13} className="text-rose-600" />
                            </button>
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                toggleFavorite(piece.id);
                              }}
                              aria-label="Favorite piece"
                              className="rounded-full border border-[#bcc0ce] bg-white p-1.5 shadow-2xs transition hover:bg-[#0a0b10] hover:text-white active:scale-90"
                            >
                              <Heart
                                size={13}
                                className={piece.favorite ? "fill-red-600 text-red-600" : "text-[#525666]"}
                              />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Card Info */}
                      <div className="p-3 bg-white">
                        <div
                          onClick={() => setInspectedItem(piece)}
                          className="cursor-pointer truncate font-gothic text-xs font-bold text-[#0a0b10] tracking-wide hover:underline"
                        >
                          {piece.name}
                        </div>
                        <div className="mt-1 flex items-center justify-between font-editorial italic text-[11px] text-[#525666]">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 rounded-full border border-black/20"
                              style={{ background: piece.dominantHex }}
                            />
                            {piece.colorName}
                          </span>
                          <span>{piece.wearCount}w</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="rounded-[22px] border border-dashed border-[#bcc0ce] bg-white/80 p-12 text-center shadow-xs">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaedf5] border border-[#c2c6d2] text-[#0a0b10]">
                    <Shirt size={26} />
                  </div>
                  <h3 className="mt-3 font-gothic text-sm sm:text-base font-bold tracking-wider text-[#0a0b10] uppercase">
                    {items.length === 0 ? "0 Pieces in Archive" : "No Pieces Found"}
                  </h3>
                  <p className="mx-auto mt-1 max-w-sm font-editorial italic text-xs text-[#525666]">
                    {items.length === 0
                      ? "Your wardrobe is fresh and empty. Upload your first clothing photo to transform it into studio catalog presentation."
                      : "Try clearing your search or category filter to view all pieces."}
                  </p>
                  {items.length === 0 && (
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 gothic-enamel-btn"
                    >
                      <Plus size={13} /> Add Piece
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 3. AI STYLIST SECTION */}
          {activeTab === "AI stylist" && (
            <StylistView
              anchorItemId={stylistAnchorId}
              onClearAnchor={() => setStylistAnchorId(undefined)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />
          )}

          {/* 4. OUTFIT PLANNER SECTION */}
          {activeTab === "Outfit planner" && <PlannerView />}

          {/* 5. SAVED OUTFITS SECTION */}
          {activeTab === "Saved outfits" && <SavedOutfitsView />}

          {/* 6. WEAR HISTORY SECTION */}
          {activeTab === "Wear history" && (
            <WearHistoryView onSelectPiece={piece => setInspectedItem(piece)} />
          )}

          {/* 7. COLOR PREFERENCES SECTION */}
          {activeTab === "Color preferences" && <ColorPreferencesView />}

          {/* 8. STYLE PROFILE SECTION */}
          {activeTab === "Style profile" && <StyleProfileView />}

          {/* 9. SETTINGS & ACCOUNT SECTION */}
          {activeTab === "Settings" && <SettingsView />}
        </div>

        {/* Global Footer (Desktop) */}
        <footer className="hidden border-t border-[#bcc0ce] bg-[#d8dbe5] px-5 py-4 text-center font-gothic text-[9.5px] tracking-[0.24em] text-[#484c5c] sm:px-8 md:block uppercase font-bold">
          MLN STUDIO &bull; ATELIER NOIRE &bull; ARCHIVAL HAUTE COUTURE STYLE ENGINE &bull; 2026
        </footer>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="mobile-bottom-bar flex items-center justify-around px-2">
        <button
          onClick={() => setActiveTab("Overview")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 ${
            activeTab === "Overview" ? "text-[#0a0b10] font-bold" : "text-[#5e6274]"
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="font-gothic text-[9px] tracking-wider">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("My wardrobe")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 ${
            activeTab === "My wardrobe" ? "text-[#0a0b10] font-bold" : "text-[#5e6274]"
          }`}
        >
          <Layers3 size={20} />
          <span className="font-gothic text-[9px] tracking-wider">Closet</span>
        </button>

        <button
          onClick={() => setIsAddModalOpen(true)}
          aria-label="Add clothing piece"
          className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-[#0a0b10] text-white shadow-lg active:scale-95"
        >
          <Plus size={24} />
        </button>

        <button
          onClick={() => setActiveTab("AI stylist")}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 ${
            activeTab === "AI stylist" ? "text-[#0a0b10] font-bold" : "text-[#5e6274]"
          }`}
        >
          <Sparkles size={20} />
          <span className="font-gothic text-[9px] tracking-wider">Stylist</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 ${
            mobileMenuOpen ? "text-[#0a0b10] font-bold" : "text-[#5e6274]"
          }`}
        >
          <Menu size={20} />
          <span className="font-gothic text-[9px] tracking-wider">More</span>
        </button>
      </nav>

      {/* MOBILE SLIDE-OVER DRAWER FOR ALL SECTIONS */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-start bg-black/80 backdrop-blur-sm md:hidden"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setMobileMenuOpen(false);
          }}
        >
          <div className="flex h-full w-[290px] flex-col bg-[#0b0c12] border-r border-white/10 p-5 text-white shadow-2xl safe-pt safe-pb">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="relative h-9 w-32">
                <Image
                  src="/brand/mln-studio-logo.png"
                  alt="MLN STUDIO"
                  fill
                  priority
                  className="object-contain object-left silver-glow"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full border border-white/10 bg-[#161722] p-1.5 text-[#8e92a2]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Navigation Sections */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-4">
              <div>
                <div className="eyebrow px-2 text-[#727688]">Workspace</div>
                <div className="mt-1 flex flex-col gap-1">
                  {NAVIGATION_ITEMS.slice(0, 5).map(nav => {
                    const Icon = nav.icon;
                    const active = activeTab === nav.label;
                    return (
                      <button
                        key={nav.label}
                        onClick={() => {
                          setActiveTab(nav.label);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs transition font-gothic tracking-wider ${
                          active ? "bg-white/10 text-white font-bold border border-white/15" : "text-[#9ca0b0] hover:bg-white/5"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{nav.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="eyebrow px-2 text-[#727688]">Style & Preferences</div>
                <div className="mt-1 flex flex-col gap-1">
                  {NAVIGATION_ITEMS.slice(5).map(nav => {
                    const Icon = nav.icon;
                    const active = activeTab === nav.label;
                    return (
                      <button
                        key={nav.label}
                        onClick={() => {
                          setActiveTab(nav.label);
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs transition font-gothic tracking-wider ${
                          active ? "bg-white/10 text-white font-bold border border-white/15" : "text-[#9ca0b0] hover:bg-white/5"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{nav.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Account Footer */}
            <div
              onClick={() => {
                setIsProfileModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="mt-auto border-t border-white/10 pt-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#161722] text-xs font-gothic font-bold text-white">
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-gothic font-semibold text-white tracking-wide">{profile.displayName}</div>
                  <div className="text-[10px] text-[#8a8e9e] font-editorial italic">{profile.city || "Sanctuary"}</div>
                </div>
              </div>
              <ChevronDown size={14} className="text-[#85877B]" />
            </div>
          </div>
        </div>
      )}

      {/* Global Interactive Modals */}
      <AddClothingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ItemDetailModal
        item={inspectedItem}
        onClose={() => setInspectedItem(null)}
        onBuildOutfitAround={handleBuildOutfitAround}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <WardrobeProvider>
      <WardrobeApp />
    </WardrobeProvider>
  );
}
