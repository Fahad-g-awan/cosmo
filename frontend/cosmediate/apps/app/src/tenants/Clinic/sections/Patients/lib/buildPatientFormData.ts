import { ALLOWED_FIELDS } from "../constants/patient.constants";
import { PatientFormValues } from "../types/patient.types";
import { normalizePhone } from "@app/lib/phone";

const REQUIRED_FIELDS = new Set([
  "firstName",
  "lastName",
  "email",
  "status",
]);

const IMAGE_FIELD = "patientImage";

/**
 * Build patient FormData.
 * - Required fields are only included when non-empty (Zod/AJV enforce them).
 * - Optional empties: omitted on create; sent as "" on update so BE can clear DB.
 */
export function buildPatientFormData(
  data: Partial<PatientFormValues>,
  extra: Record<string, unknown> = {},
  options: { clearEmptyOptionals?: boolean } = {},
): FormData {
  const { clearEmptyOptionals = false } = options;
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (!ALLOWED_FIELDS.has(key)) return;

    if (key === "phone") {
      const phone = normalizePhone(value);
      if (phone) {
        requestData.phone = phone;
      } else if (clearEmptyOptionals) {
        requestData.phone = "";
      }
      return;
    }

    if (key === IMAGE_FIELD) {
      if (value instanceof File) {
        requestData[key] = value;
      } else if (typeof value === "string" && value.trim()) {
        requestData[key] = value.trim();
      } else if (clearEmptyOptionals) {
        requestData[key] = "";
      }
      return;
    }

    if (REQUIRED_FIELDS.has(key)) {
      if (value === undefined || value === null || value === "") return;
      requestData[key] = value;
      return;
    }

    // Optional fields
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "number" && Number.isNaN(value))
    ) {
      if (clearEmptyOptionals) requestData[key] = "";
      return;
    }

    requestData[key] = value;
  });

  const formData = new FormData();

  Object.entries(requestData).forEach(([key, value]) => {
    if (value === undefined) return;

    if (value === null) {
      formData.append(key, "");
      return;
    }

    if (typeof value === "object" && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "string" || value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}
