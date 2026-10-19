import { WardrobeItem } from "../types/wardrobe";
import { UserProfile } from "../types/profile";

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: "user_threads_demo",
  displayName: "Alex Mercer",
  email: "alex@threads.style",
  onboardingCompleted: true,
  paletteDirection: "Balanced neutrals",
  favoriteColors: ["Sky blue", "Navy", "Sand", "Olive"],
  dislikedColors: ["Neon yellow", "Hot pink"],
  preferredNeutrals: ["Navy", "Charcoal", "White", "Sand"],
  preferredAccents: ["Olive", "Sky blue", "Cognac", "Burgundy"],
  preferredContrast: "Medium contrast",
  stylePreferences: ["Minimalist", "Smart casual", "Timeless menswear"],
  fitPreferences: ["Regular", "Tailored"],
  city: "New York",
  latitude: 40.7128,
  longitude: -74.0060,
  enableWeatherStyling: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-10-18T00:00:00Z"
};

export const INITIAL_WARDROBE_ITEMS: WardrobeItem[] = [];

export const SAMPLE_WARDROBE_ITEMS: WardrobeItem[] = [];
