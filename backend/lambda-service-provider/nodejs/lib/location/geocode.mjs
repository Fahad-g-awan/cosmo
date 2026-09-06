import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";

/** Google statuses where the address simply could not be resolved — save proceeds with null lat/lon. */
const GEOCODE_NO_RESULT_STATUSES = new Set(["ZERO_RESULTS", "INVALID_REQUEST"]);

/**
 * Resolve an address to coordinates via Google Geocoding API.
 * Returns `{ lat: null, lon: null }` when the address is empty or cannot be geocoded.
 * Throws only for configuration/quota failures that should block the operation.
 */
export const geocodeAddress = async (address, config) => {
  try {
    if (!config.GOOGLE_GEOCODING_API_URL || !config.GOOGLE_GEOCODING_API_KEY) {
      throw httpError({
        error: API_ERRORS.INTERNAL_ERROR,
        message: "Geocoding is not configured",
        details: ["Geocode API URL or API key is missing"],
      });
    }

    if (address.trim() === "" || address.split(",").length === 0) {
      return { lat: null, lon: null };
    }

    const url =
      config.GOOGLE_GEOCODING_API_URL +
      `?address=${encodeURIComponent(address)}` +
      `&key=${config.GOOGLE_GEOCODING_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "OK" && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lon: location.lng };
    }

    if (
      GEOCODE_NO_RESULT_STATUSES.has(data.status) ||
      (data.status === "OK" && data.results.length === 0)
    ) {
      console.warn(
        `[geocode] No coordinates for address (status=${data.status}):`,
        address,
      );
      return { lat: null, lon: null };
    }

    console.error("Geocode API error:", data.status, data.error_message || "");
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Geocode API error",
      details: [data?.error_message ?? data.status ?? "Geocode API error"],
    });
  } catch (error) {
    if (error?.statusCode) throw error;

    console.error("Geocode API error:", error);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "Geocode API error",
      details: [error?.message ?? "Something went wrong"],
    });
  }
};
