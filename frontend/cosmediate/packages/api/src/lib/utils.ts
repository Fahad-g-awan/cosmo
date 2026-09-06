import { AxiosError } from "axios";
import type { ApiError } from "../types/auth.types";

/** Standard failure shape returned by every `*Api` catch block. */
export interface ApiFailureResponse {
  success: false;
  error?: string;
  message: string;
  details?: string[] | null;
}

/**
 * Normalize any API call failure into a structured `{ success: false, … }` body.
 *
 * All `*Api` functions use `return handleApiError(error)` in their catch blocks.
 * This must **return** (not throw) so callers can check `response.success`.
 *
 * Message priority: backend `message` → backend `error` code → axios message → fallback.
 * `details` is preserved when the backend sends a string array (e.g. `oauth_only_user`).
 */
export const handleApiError = <T = ApiFailureResponse>(
  error: unknown,
): T => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    const apiError =
      data && typeof data === "object"
        ? (data as ApiError & { details?: string[] | null })
        : undefined;

    const message =
      typeof apiError?.message === "string" && apiError.message.trim()
        ? apiError.message
        : typeof apiError?.error === "string"
          ? apiError.error
          : error.message || "Something went wrong, please try again";

    const details = Array.isArray(apiError?.details)
      ? apiError.details.filter((d): d is string => typeof d === "string")
      : null;

    console.error("API Error:", {
      status: error.response?.status,
      message,
      error: apiError?.error,
      details,
    });

    return {
      success: false,
      error: typeof apiError?.error === "string" ? apiError.error : undefined,
      message,
      details,
    } as T;
  }

  console.error("Unexpected error:", error);
  return {
    success: false,
    message: "Something went wrong, please try again",
  } as T;
};

/**
 * Logs API response for debugging
 */
export const logApiResponse = <T>(endpoint: string, data: T): T => {
  if (
    typeof process !== "undefined" &&
    process.env?.NODE_ENV === "development"
  ) {
    console.log(`API Response [${endpoint}]:`, data);
  }
  return data;
};
