import { NextResponse } from "next/server";
import { fetchLiveWeather } from "../../../lib/services/weather";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : 40.7128;
    const lon = searchParams.get("lon") ? parseFloat(searchParams.get("lon")!) : -74.0060;
    const city = searchParams.get("city") || "New York";

    const weather = await fetchLiveWeather(lat, lon, city);

    if (!weather) {
      return NextResponse.json({ error: "Weather data unavailable" }, { status: 503 });
    }

    return NextResponse.json({ success: true, weather });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Weather fetch failed" }, { status: 500 });
  }
}
