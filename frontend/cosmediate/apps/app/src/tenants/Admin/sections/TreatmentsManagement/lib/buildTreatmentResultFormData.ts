import { ALLOWED_FIELDS } from "../constants/treatmentResult.constants";
import { TreatmentResultFormValues } from "../types/treatmentResult.types";

const hasUploadableImage = (value: unknown): boolean => {
  if (value instanceof File) return true;
  return typeof value === "string" && value.trim().length > 0;
};

export const buildTreatmentResultFormData = (
  data: Partial<TreatmentResultFormValues>,
  extra: Record<string, unknown> = {},
): FormData => {
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (!ALLOWED_FIELDS.has(key) || value === undefined || value === null) {
      return;
    }

    if (key === "beforeImage" || key === "afterImage") {
      if (hasUploadableImage(value)) {
        requestData[key] = value;
      }
      return;
    }

    if (typeof value === "string" && value.trim() === "") return;

    requestData[key] = value;
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
};
