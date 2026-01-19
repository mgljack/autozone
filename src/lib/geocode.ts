export type GeocodeResult = {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
};

export async function geocodeAddress(address: string): Promise<GeocodeResult[]> {
  if (address.length < 6) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "AutoZone.mn/1.0",
      },
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((item: any) => ({
      lat: item.lat,
      lon: item.lon,
      display_name: item.display_name,
      place_id: item.place_id,
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
}

