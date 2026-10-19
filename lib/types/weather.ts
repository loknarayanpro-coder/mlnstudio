export interface WeatherCondition {
  city: string;
  temperatureC: number;
  temperatureF: number;
  conditionCode: number;
  description: string;
  isRainy: boolean;
  isCold: boolean;     // < 15°C
  isFreezing: boolean; // < 5°C
  isWarm: boolean;     // 18-26°C
  isHot: boolean;      // > 26°C
  humidity: number;
  windSpeedKmh: number;
  suggestedLayers: "Light single layer" | "Shirt & light jacket" | "Sweater or heavy coat" | "Layered warm outerwear & accessories";
  updatedAt: string;
}
