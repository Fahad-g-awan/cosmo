import { ALLOWED_FIELDS } from "../constants/admin.constants";
import { AdminFormValues } from "../types/admin.types";
import { normalizePhone } from "@app/lib/phone";

export function buildAdminFormData(
  data: Partial<AdminFormValues>,
  extra: Record<string, unknown> = {},
): FormData {
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (key === "phone") {
      const phone = normalizePhone(value);
      if (phone) requestData.phone = phone;
      return;
    }

    if (
      ALLOWED_FIELDS.has(key) &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      requestData[key] = value;
    }
  });

  const formData = new FormData();

  Object.entries(requestData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

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
