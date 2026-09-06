import { API_ERRORS } from "../../constants/errors/index.mjs";
import { httpError } from "../errors/http-error.mjs";

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

/**
 * Verify a reCAPTCHA v3 token with Google's API.
 *
 * @param {string} token        – The recaptchaToken from the client
 * @param {string} secretKey    – RECAPTCHA_SECRET_KEY from config/SSM
 * @param {object} [opts]
 * @param {number} [opts.minScore=0.4]  – Minimum acceptable score (0.0–1.0)
 * @param {string} [opts.expectedAction] – If set, the action must match
 * @returns {Promise<{ success: boolean, score: number, action: string }>}
 */
export const verifyRecaptcha = async (token, secretKey, opts = {}) => {
  const { minScore = 0.4, expectedAction } = opts;

  if (!token || typeof token !== "string") {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      message: "reCAPTCHA verification failed",
      details: ["Missing or invalid reCAPTCHA token"],
    });
  }

  if (!secretKey) {
    console.error("[recaptcha] RECAPTCHA_SECRET_KEY is not configured");
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      details: ["reCAPTCHA is not configured on the server"],
    });
  }

  let result;
  try {
    const res = await fetch(RECAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!res.ok) {
      console.error("[recaptcha] Google API HTTP error:", res.status);
      throw new Error(`Google reCAPTCHA API returned ${res.status}`);
    }

    result = await res.json();
  } catch (err) {
    // Network / fetch-level error — don't block the user, but log it
    if (err?.statusCode) throw err; // re-throw our own httpError({ error: API_ERRORS.INTERNAL_ERROR })
    console.error("[recaptcha] Verification request failed:", err?.message);
    throw httpError({
      error: API_ERRORS.INTERNAL_ERROR,
      message: "reCAPTCHA verification unavailable",
      details: [
        "Could not reach reCAPTCHA verification service. Please try again.",
      ],
    });
  }

  console.log("[recaptcha] Verification result:", JSON.stringify(result));

  if (!result.success) {
    const codes = (result["error-codes"] || []).join(", ");
    console.warn("[recaptcha] Token invalid. Error codes:", codes);
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      message: "reCAPTCHA verification failed",
      details: ["reCAPTCHA token is invalid or expired. Please try again."],
    });
  }

  if (!result.score || result.score < minScore) {
    console.warn(
      `[recaptcha] Score too low: ${result.score} (min: ${minScore})`,
    );
    throw httpError({
      error: API_ERRORS.FORBIDDEN,
      message: "Request blocked",
      details: [
        "Our system flagged this request as potentially automated. Please try again.",
      ],
    });
  }

  if (expectedAction && result.action !== expectedAction) {
    console.warn(
      `[recaptcha] Action mismatch: expected="${expectedAction}", got="${result.action}"`,
    );
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      message: "reCAPTCHA verification failed",
      details: ["reCAPTCHA action mismatch. Please try again."],
    });
  }

  return {
    success: true,
    score: result.score,
    action: result.action,
  };
};
