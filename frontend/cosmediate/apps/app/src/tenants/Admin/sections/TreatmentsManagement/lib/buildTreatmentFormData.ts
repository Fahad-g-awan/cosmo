import { ALLOWED_FIELDS } from "../constants/treatment.constant";
import { TreatmentFormValues } from "../types/treatment.types";

export const buildTreatmentFormData = (
  data: Partial<TreatmentFormValues>,
  extra: Record<string, unknown> = {},
): FormData => {
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (!ALLOWED_FIELDS.has(key) || value === undefined || value === null) {
      return;
    }

    if (key === "faqs") {
      const faqs = Array.isArray(value)
        ? value.filter((faq) => {
            if (!faq || typeof faq !== "object" || !("question" in faq)) {
              return false;
            }
            const question = (faq.question ?? "").trim();
            const answer = (faq as { answer?: { content?: unknown[] } }).answer;
            const hasAnswer =
              Array.isArray(answer?.content) && answer.content.length > 0;
            return question.length > 0 || hasAnswer;
          })
        : [];

      if (faqs.length > 0) {
        requestData.faqs = faqs;
      }
      return;
    }

    if (key === "tags") {
      if (Array.isArray(value) && value.length > 0) {
        requestData.tags = value;
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
