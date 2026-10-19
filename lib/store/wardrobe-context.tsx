"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { WardrobeItem, MainCategory, Occasion, Season } from "../types/wardrobe";
import { OutfitRecommendation, SavedOutfit, OutfitFeedbackEvent, OutfitFeedbackType, RejectionReason } from "../types/outfit";
import { UserProfile } from "../types/profile";
import { WeatherCondition } from "../types/weather";
import { INITIAL_WARDROBE_ITEMS, DEFAULT_USER_PROFILE } from "../data/initial-wardrobe";
import { generateOutfitRecommendations } from "../services/outfit-engine";
import { fetchLiveWeather } from "../services/weather";
import { getSupabaseClient, isSupabaseConfigured } from "../supabase/client";

interface WardrobeContextType {
  // User & Auth
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isAuthenticated: boolean;
  isSupabaseConnected: boolean;
  isInitialized: boolean;
  userEmail: string | null;
  signIn: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;

  // Wardrobe Items
  items: WardrobeItem[];
  addItem: (item: Omit<WardrobeItem, "id" | "userId" | "createdAt" | "updatedAt" | "wearCount">) => WardrobeItem;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => void;
  deleteItem: (id: string) => void;
  bulkDeleteItems: (ids: string[]) => void;
  toggleFavorite: (id: string) => void;
  markItemWorn: (id: string) => void;
  resetWardrobe: () => void;

  // Outfit Recommendations
  recommendations: OutfitRecommendation[];
  selectedOccasion: Occasion;
  setSelectedOccasion: (occ: Occasion) => void;
  refreshRecommendations: (anchorItemId?: string) => void;

  // Saved Outfits
  savedOutfits: SavedOutfit[];
  saveOutfit: (outfit: { name: string; occasion: Occasion; itemIds: string[]; notes?: string; scheduledForDate?: string }) => void;
  deleteSavedOutfit: (id: string) => void;
  recordOutfitFeedback: (feedback: { outfitId?: string; itemIds: string[]; type: OutfitFeedbackType; reason?: RejectionReason; notes?: string }) => void;
  markOutfitWorn: (savedOutfitId: string) => void;

  // Weather
  weather: WeatherCondition | null;
  refreshWeather: () => Promise<void>;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const WardrobeContext = createContext<WardrobeContextType | null>(null);

const STORAGE_KEYS = {
  AUTH: "threads_auth_session_v3",
  ITEMS: "threads_wardrobe_items_v5_clean",
  PROFILE: "threads_user_profile_v3",
  SAVED_OUTFITS: "threads_saved_outfits_v5_clean",
  FEEDBACK: "threads_outfit_feedback_v5_clean"
};

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to fallback
    }
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<OutfitFeedbackEvent[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion>("Everyday");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 1. Initial Load from LocalStorage or Supabase
  useEffect(() => {
    try {
      // Clear legacy storage keys to guarantee fresh empty wardrobe
      ["threads_wardrobe_items_v3", "threads_wardrobe_items_v2", "threads_wardrobe_items_v4", "threads_saved_outfits_v3"].forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });

      const storedItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (storedItems) {
        try {
          const parsed = JSON.parse(storedItems);
          setItems(Array.isArray(parsed) ? parsed : []);
        } catch {
          setItems([]);
        }
      } else {
        setItems([]);
      }

      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }

      const storedSaved = localStorage.getItem(STORAGE_KEYS.SAVED_OUTFITS);
      if (storedSaved) {
        setSavedOutfits(JSON.parse(storedSaved));
      }

      const storedFeedback = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
      if (storedFeedback) {
        setFeedbackHistory(JSON.parse(storedFeedback));
      }

      const storedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (storedAuth) {
        try {
          const authObj = JSON.parse(storedAuth);
          if (authObj?.isAuthenticated && authObj?.userEmail) {
            setIsAuthenticated(true);
            setUserEmail(authObj.userEmail);
          }
        } catch {
          // invalid auth payload
        }
      }
    } catch (e) {
      console.warn("Could not read localStorage cache:", e);
    }
    setIsInitialized(true);
  }, []);

  // 2. Persist to LocalStorage on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn("Could not write items to localStorage:", e);
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn("Could not write profile to localStorage:", e);
    }
  }, [profile, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_OUTFITS, JSON.stringify(savedOutfits));
    } catch (e) {
      console.warn("Could not write saved outfits to localStorage:", e);
    }
  }, [savedOutfits, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(feedbackHistory));
    } catch (e) {
      console.warn("Could not write feedback to localStorage:", e);
    }
  }, [feedbackHistory, isInitialized]);

  // 3. Live Weather Fetch
  const refreshWeather = async () => {
    if (!profile.enableWeatherStyling) return;
    const w = await fetchLiveWeather(profile.latitude, profile.longitude, profile.city);
    if (w) setWeather(w);
  };

  useEffect(() => {
    refreshWeather();
  }, [profile.city, profile.enableWeatherStyling]);

  // 4. Recommendations calculation
  const recommendations = useMemo(() => {
    return generateOutfitRecommendations(items, {
      occasion: selectedOccasion,
      profile,
      weather: null, // Weather penalties and widget removed per user request
      feedbackHistory
    });
  }, [items, selectedOccasion, profile, feedbackHistory]);

  const refreshRecommendations = (anchorItemId?: string) => {
    // Triggers recalculation with optional anchor item
    setSelectedOccasion(curr => curr);
  };

  // 5. Item Mutations
  const addItem = (itemData: Omit<WardrobeItem, "id" | "userId" | "createdAt" | "updatedAt" | "wearCount">): WardrobeItem => {
    const newItem: WardrobeItem = {
      ...itemData,
      id: generateUUID(),
      userId: profile.id,
      wearCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setItems(curr => [newItem, ...curr]);
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<WardrobeItem>) => {
    setItems(curr => curr.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
  };

  const deleteItem = (id: string) => {
    setItems(curr => curr.filter(item => item.id !== id));
  };

  const bulkDeleteItems = (ids: string[]) => {
    const set = new Set(ids);
    setItems(curr => curr.filter(item => !set.has(item.id)));
  };

  const toggleFavorite = (id: string) => {
    setItems(curr => curr.map(item => item.id === id ? { ...item, favorite: !item.favorite } : item));
  };

  const markItemWorn = (id: string) => {
    const now = new Date().toISOString();
    setItems(curr => curr.map(item => item.id === id ? { ...item, wearCount: item.wearCount + 1, lastWornAt: now } : item));
  };

  const resetWardrobe = () => {
    setItems([]);
    setSavedOutfits([]);
    setFeedbackHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.ITEMS);
      localStorage.removeItem(STORAGE_KEYS.SAVED_OUTFITS);
      localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
    } catch {}
  };

  // 6. Profile Mutations
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(curr => ({ ...curr, ...updates, updatedAt: new Date().toISOString() }));
  };

  // 7. Outfit Mutations
  const saveOutfit = (outfitData: { name: string; occasion: Occasion; itemIds: string[]; notes?: string; scheduledForDate?: string }) => {
    const newSaved: SavedOutfit = {
      id: generateUUID(),
      userId: profile.id,
      name: outfitData.name,
      occasion: outfitData.occasion,
      itemIds: outfitData.itemIds,
      styleTags: [],
      notes: outfitData.notes,
      wearCount: 0,
      scheduledForDate: outfitData.scheduledForDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setSavedOutfits(curr => [newSaved, ...curr]);
  };

  const deleteSavedOutfit = (id: string) => {
    setSavedOutfits(curr => curr.filter(o => o.id !== id));
  };

  const markOutfitWorn = (savedOutfitId: string) => {
    const now = new Date().toISOString();
    const outfit = savedOutfits.find(o => o.id === savedOutfitId);
    if (!outfit) return;

    setSavedOutfits(curr => curr.map(o => o.id === savedOutfitId ? { ...o, wearCount: o.wearCount + 1, lastWornAt: now } : o));

    // Also mark each piece in the outfit as worn
    outfit.itemIds.forEach(id => markItemWorn(id));
  };

  const recordOutfitFeedback = (feedback: {
    outfitId?: string;
    itemIds: string[];
    type: OutfitFeedbackType;
    reason?: RejectionReason;
    notes?: string;
  }) => {
    const newEvent: OutfitFeedbackEvent = {
      id: generateUUID(),
      userId: profile.id,
      outfitId: feedback.outfitId,
      recommendedItemIds: feedback.itemIds,
      feedbackType: feedback.type,
      reason: feedback.reason,
      notes: feedback.notes,
      createdAt: new Date().toISOString()
    };
    setFeedbackHistory(curr => [newEvent, ...curr]);
  };

  // 8. Auth functions
  const signIn = async (email: string, password?: string) => {
    const supabase = getSupabaseClient();
    if (supabase && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        throw new Error(error.message);
      }
      const user = data.user;
      const finalEmail = user?.email || email;
      setUserEmail(finalEmail);
      setIsAuthenticated(true);
      setProfile(curr => ({ ...curr, email: finalEmail, displayName: finalEmail.split("@")[0] }));
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, userEmail: finalEmail }));
      } catch (e) {
        console.warn("Could not write auth to localStorage:", e);
      }
      return { success: true };
    }

    // Local / Dev fallback
    setUserEmail(email);
    setIsAuthenticated(true);
    setProfile(curr => ({ ...curr, email, displayName: email.split("@")[0] }));
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, userEmail: email }));
    } catch (e) {
      console.warn("Could not write auth to localStorage:", e);
    }
    return { success: true };
  };

  const signUp = async (email: string, password?: string) => {
    const supabase = getSupabaseClient();
    if (supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) {
        throw new Error(error.message);
      }
      const user = data.user;
      const finalEmail = user?.email || email;
      setUserEmail(finalEmail);
      setIsAuthenticated(true);
      setItems([]);
      setSavedOutfits([]);
      setFeedbackHistory([]);
      setProfile(curr => ({ ...curr, email: finalEmail, displayName: finalEmail.split("@")[0], onboardingCompleted: false }));
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, userEmail: finalEmail }));
      } catch (e) {
        console.warn("Could not write auth to localStorage:", e);
      }
      return { success: true };
    }

    setUserEmail(email);
    setIsAuthenticated(true);
    setItems([]);
    setSavedOutfits([]);
    setFeedbackHistory([]);
    setProfile(curr => ({ ...curr, email, displayName: email.split("@")[0], onboardingCompleted: false }));
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ isAuthenticated: true, userEmail: email }));
    } catch (e) {
      console.warn("Could not write auth to localStorage:", e);
    }
    return { success: true };
  };

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Supabase sign out error:", e);
      }
    }
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (e) {
      console.warn("Could not remove auth from localStorage:", e);
    }
    setUserEmail(null);
    setIsAuthenticated(false);
  };

  return (
    <WardrobeContext.Provider
      value={{
        profile,
        updateProfile,
        isAuthenticated,
        isSupabaseConnected: isSupabaseConfigured,
        isInitialized,
        userEmail,
        signIn,
        signUp,
        signOut,
        items,
        addItem,
        updateItem,
        deleteItem,
        bulkDeleteItems,
        toggleFavorite,
        markItemWorn,
        resetWardrobe,
        recommendations,
        selectedOccasion,
        setSelectedOccasion,
        refreshRecommendations,
        savedOutfits,
        saveOutfit,
        deleteSavedOutfit,
        recordOutfitFeedback,
        markOutfitWorn,
        weather,
        refreshWeather,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error("useWardrobe must be used within a WardrobeProvider");
  }
  return context;
}
