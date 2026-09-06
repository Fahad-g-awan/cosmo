import { DateTime } from "luxon";

const ISO_DATE_RE =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/;

function formatIsoDate(value: string): string {
  const dt = DateTime.fromISO(value, { zone: "utc" });
  if (!dt.isValid) return value;
  return dt.toFormat("dd LLL yyyy, HH:mm") + " UTC";
}

function formatObjectValue(value: Record<string, unknown>): string {
  if (typeof value.fullName === "string" && value.fullName) return value.fullName;
  if (typeof value.name === "string" && value.name) return value.name;
  if (typeof value.title === "string" && value.title) return value.title;
  if (typeof value.label === "string" && value.label) return value.label;
  if (typeof value.email === "string" && value.email) return value.email;
  return JSON.stringify(value);
}

export function formatCellValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    if (ISO_DATE_RE.test(value)) return formatIsoDate(value);
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) {
    return DateTime.fromJSDate(value, { zone: "utc" }).toFormat(
      "dd LLL yyyy, HH:mm",
    ) + " UTC";
  }
  if (typeof value === "object") {
    return formatObjectValue(value as Record<string, unknown>);
  }
  return String(value);
}
