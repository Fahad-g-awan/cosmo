export const fetchPlaces = async (query: string) => {
  if (!query) return;

  try {
    const response = await fetch("/api/places", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error fetching places:", err);
  }
};
