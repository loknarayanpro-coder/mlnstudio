import { WeatherCondition } from "../types/weather";

const WEATHER_CODE_MAP: Record<number, { description: string; isRainy: boolean }> = {
  0: { description: "Clear sky", isRainy: false },
  1: { description: "Mainly clear", isRainy: false },
  2: { description: "Partly cloudy", isRainy: false },
  3: { description: "Overcast", isRainy: false },
  45: { description: "Foggy", isRainy: false },
  48: { description: "Depositing rime fog", isRainy: false },
  51: { description: "Light drizzle", isRainy: true },
  53: { description: "Moderate drizzle", isRainy: true },
  55: { description: "Dense drizzle", isRainy: true },
  61: { description: "Slight rain", isRainy: true },
  63: { description: "Moderate rain", isRainy: true },
  65: { description: "Heavy rain", isRainy: true },
  71: { description: "Slight snow", isRainy: false },
  73: { description: "Moderate snow", isRainy: false },
  75: { description: "Heavy snow", isRainy: false },
  80: { description: "Slight rain showers", isRainy: true },
  81: { description: "Moderate rain showers", isRainy: true },
  82: { description: "Violent rain showers", isRainy: true },
  95: { description: "Thunderstorm", isRainy: true }
};

// Memory cache for 15 minutes
let cachedWeather: { condition: WeatherCondition; expiresAt: number } | null = null;

export async function fetchLiveWeather(
  latitude = 40.7128, // Default New York or user coordinates
  longitude = -74.0060,
  cityName = "New York"
): Promise<WeatherCondition | null> {
  const now = Date.now();
  if (cachedWeather && cachedWeather.expiresAt > now && cachedWeather.condition.city === cityName) {
    return cachedWeather.condition;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    const res = await fetch(url, { next: { revalidate: 900 } }); // 15 mins revalidate
    if (!res.ok) return null;

    const data = await res.json();
    const current = data.current;
    if (!current) return null;

    const tempC = Math.round(current.temperature_2m);
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const code = current.weather_code || 0;
    const info = WEATHER_CODE_MAP[code] || { description: "Clear", isRainy: false };

    const isCold = tempC < 15;
    const isFreezing = tempC < 5;
    const isWarm = tempC >= 18 && tempC <= 26;
    const isHot = tempC > 26;

    let suggestedLayers: WeatherCondition["suggestedLayers"] = "Shirt & light jacket";
    if (isFreezing) suggestedLayers = "Layered warm outerwear & accessories";
    else if (isCold) suggestedLayers = "Sweater or heavy coat";
    else if (isHot) suggestedLayers = "Light single layer";
    else if (isWarm) suggestedLayers = "Light single layer";

    const condition: WeatherCondition = {
      city: cityName,
      temperatureC: tempC,
      temperatureF: tempF,
      conditionCode: code,
      description: info.description,
      isRainy: info.isRainy,
      isCold,
      isFreezing,
      isWarm,
      isHot,
      humidity: current.relative_humidity_2m || 50,
      windSpeedKmh: Math.round(current.wind_speed_10m || 0),
      suggestedLayers,
      updatedAt: new Date().toISOString()
    };

    cachedWeather = { condition, expiresAt: now + 15 * 60 * 1000 };
    return condition;
  } catch (err) {
    console.warn("Weather fetch failed:", err);
    return null;
  }
}
