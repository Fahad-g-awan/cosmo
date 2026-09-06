import { ALLOWED_FIELDS } from "../constants/manager.constants";
import { ManagerFormValues } from "../types/manager.types";
import { normalizePhone } from "@app/lib/phone";

export function buildManagerFormData(
  data: Partial<ManagerFormValues>,
  extra: Record<string, unknown> = {},
): FormData {
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (key === "clinicId") return;

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

  if (Array.isArray(data.clinicIds) && data.clinicIds.length > 0) {
    requestData.clinicIds = data.clinicIds;
  } else if (data.clinicId) {
    requestData.clinicIds = [data.clinicId];
  }

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
