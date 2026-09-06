export const parseError = (error: unknown) => {
  let errorMessage = "Unexpected error occurred";

  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return errorMessage;
};

export const ordinalSuffix = (n: number) => {
  if (n > 3 && n < 21) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const geocodeAddress = async (address: string) => {
  const url = `${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_URL}?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "OK") {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  } else {
    console.error("Geocode API error:", data.status, data.error_message || "");
    throw new Error(`Geocode failed: ${data.status}`);
  }
};

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const truncateText = (text: string, offset: number) => {
  if (!text) return "";
  if (text.length <= offset) return text;

  return text.slice(0, offset) + "...";
};
