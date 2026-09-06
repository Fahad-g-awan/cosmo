import { z } from "zod";

/** E.164: + then 1–15 digits, first digit 1–9. */
export const PHONE_E164_PATTERN = /^\+[1-9]\d{1,14}$/;

export const PHONE_FORMAT_HINT =
  "Include country code. Example: +1 555 123 4567 — spaces and dashes are fine.";

export const PHONE_INVALID_MESSAGE =
  "Enter a valid phone with country code (e.g. +15551234567)";

/**
 * Strip spaces / dashes / brackets / dots, coerce `00` → `+`,
 * and prepend `+` when the value is digits-only.
 * Empty → undefined.
 */
export function normalizePhone(raw: unknown): string | undefined {
  if (raw == null) return undefined;

  let value = String(raw).trim();
  if (!value) return undefined;
  if (value.toUpperCase() === "N/A") return undefined;

  value = value.replace(/[\s\-().]/g, "");

  if (value.startsWith("00")) {
    value = `+${value.slice(2)}`;
  }

  if (!value.startsWith("+") && /^\d+$/.test(value)) {
    value = `+${value}`;
  }

  if (value.startsWith("+")) {
    value = `+${value.slice(1).replace(/\D/g, "")}`;
  } else {
    value = value.replace(/\D/g, "");
  }

  if (!value || value === "+") return undefined;
  return value;
}

export function isValidE164Phone(raw: unknown): boolean {
  const normalized = normalizePhone(raw);
  return Boolean(normalized && PHONE_E164_PATTERN.test(normalized));
}

/** Optional phone: blank → undefined; otherwise must be E.164 after normalize. */
export const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    return normalizePhone(value);
  },
  z
    .string()
    .regex(PHONE_E164_PATTERN, PHONE_INVALID_MESSAGE)
    .optional()
    .nullable(),
);

/** Required phone: must normalize to E.164. */
export const requiredPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    return normalizePhone(value) ?? "";
  },
  z
    .string()
    .min(1, "Phone number is required")
    .regex(PHONE_E164_PATTERN, PHONE_INVALID_MESSAGE),
);
