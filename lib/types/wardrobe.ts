export type MainCategory =
  | "Tops"
  | "Bottoms"
  | "Dresses & One-Pieces"
  | "Outerwear"
  | "Footwear"
  | "Watches"
  | "Bags"
  | "Accessories";

export type SubCategory =
  | "T-Shirt"
  | "Shirt"
  | "Polo"
  | "Blouse"
  | "Jeans"
  | "Trousers"
  | "Chinos"
  | "Shorts"
  | "Skirt"
  | "Dress"
  | "Ethnic Wear"
  | "Traditional"
  | "Jacket"
  | "Coat"
  | "Hoodie"
  | "Sweater"
  | "Sneakers"
  | "Loafers"
  | "Formal Shoes"
  | "Boots"
  | "Sandals"
  | "Watch"
  | "Belt"
  | "Sunglasses"
  | "Bag"
  | "Hat"
  | "Jewelry"
  | "Other";

export type Occasion =
  | "Everyday"
  | "Casual"
  | "Smart casual"
  | "Office"
  | "Formal"
  | "Party"
  | "Date night"
  | "Weekend"
  | "Travel"
  | "Festive"
  | "Wedding guest";

export type Season = "Spring" | "Summer" | "Autumn" | "Winter" | "All-Season";

export type FitType = "Slim" | "Regular" | "Relaxed" | "Oversized" | "Tailored" | "Unspecified";

export interface GarmentAttributes {
  pattern?: string;
  material?: string;
  fit?: FitType;
  sleeveLength?: "Short" | "Long" | "Sleeveless" | "Three-Quarter" | "None";
  neckline?: "Crew" | "V-Neck" | "Collar" | "Button-Down" | "Turtle" | "Scoop" | "None";
  seasons: Season[];
  occasions: Occasion[];
  brand?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  name: string;
  category: MainCategory;
  subcategory: SubCategory;
  clothingType: string;
  colorName: string;
  dominantHex: string;
  secondaryColors?: string[];
  attributes: GarmentAttributes;
  originalImagePath: string;
  processedImagePath?: string;
  thumbnailPath?: string;
  imageProcessingStatus: "original" | "processing" | "processed" | "failed";
  aiAnalysisStatus: "pending" | "completed" | "manual" | "failed";
  aiConfidence?: number;
  favorite: boolean;
  wearCount: number;
  lastWornAt?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WardrobeFilterOptions {
  category?: MainCategory | "All";
  color?: string;
  occasion?: Occasion | "All";
  season?: Season | "All";
  searchQuery?: string;
  onlyFavorites?: boolean;
  sortBy?: "recent" | "wearCount" | "name" | "category";
  sortOrder?: "asc" | "desc";
}
