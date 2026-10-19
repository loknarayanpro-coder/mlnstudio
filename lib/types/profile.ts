export type ContrastPreference = "High contrast" | "Medium contrast" | "Low contrast / Tonal";

export type PaletteDirection =
  | "Balanced neutrals"
  | "Warm neutrals"
  | "Cool tones"
  | "Earthy tones"
  | "Monochromatic"
  | "Bold & vibrant";

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  onboardingCompleted: boolean;
  paletteDirection: PaletteDirection;
  favoriteColors: string[];
  dislikedColors: string[];
  preferredNeutrals: string[];
  preferredAccents: string[];
  preferredContrast: ContrastPreference;
  stylePreferences: string[]; // e.g. "Minimalist", "Old Money", "Streetwear", "Classic Menswear", "Bohemian", "Smart Casual"
  fitPreferences: string[];   // e.g. "Relaxed", "Tailored", "Slim"
  city?: string;
  latitude?: number;
  longitude?: number;
  enableWeatherStyling: boolean;
  createdAt: string;
  updatedAt: string;
}
