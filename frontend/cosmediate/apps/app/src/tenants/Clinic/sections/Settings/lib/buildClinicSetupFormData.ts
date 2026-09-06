import { CLINIC_ALLOWED_FIELDS } from "../constants/clinic.constants";
import { SPECIALIST_ALLOWED_FIELDS } from "../constants/specialist.constants";
import { ClinicFormValues } from "../types/clinic.types";
import { normalizePhone } from "@app/lib/phone";

const CLEARABLE_OPTIONAL_KEYS = new Set([
  "phone",
  "clinicAge",
  "instagramId",
  "website",
  "country",
  "state",
  "city",
  "postalCode",
  "completeAddress",
  "age",
  "gender",
  "totalExperience",
]);

export type BuildClinicSetupFormDataOptions = {
  /** Empty optionals are sent as "" so BE Clearable* fields wipe old DB values. */
  clearEmptyOptionals?: boolean;
  allowedFields?: Set<string>;
};

/**
 * Build FormData for clinic (or specialist) setup updates.
 * Required fields must already be present; empty optionals clear when requested.
 */
export function buildClinicSetupFormData(
  data: Partial<ClinicFormValues>,
  extra: Record<string, unknown> = {},
  options: BuildClinicSetupFormDataOptions = {},
): FormData {
  const {
    clearEmptyOptionals = true,
    allowedFields = CLINIC_ALLOWED_FIELDS,
  } = options;
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (!allowedFields.has(key)) return;

    if (key === "clinicImages") return;
    if (key === "certificates") return;

    if (key === "phone") {
      const phone = normalizePhone(value);
      if (phone) {
        requestData.phone = phone;
      } else if (clearEmptyOptionals) {
        requestData.phone = "";
      }
      return;
    }

    if (key === "faqs") {
      const faqs = Array.isArray(value)
        ? value.filter(
            (faq): faq is NonNullable<ClinicFormValues["faqs"]>[number] => {
              if (!faq || typeof faq !== "object" || !("question" in faq)) {
                return false;
              }
              const question = (faq.question ?? "").trim();
              const hasAnswer =
                Array.isArray(faq.answer?.content) &&
                faq.answer.content.length > 0;
              return question.length > 0 || hasAnswer;
            },
          )
        : [];
      if (faqs.length > 0) {
        requestData.faqs = faqs;
      } else if (clearEmptyOptionals) {
        requestData.faqs = [];
      }
      return;
    }

    if (key === "tags") {
      if (Array.isArray(value) && value.length > 0) {
        requestData.tags = value;
      } else if (clearEmptyOptionals) {
        requestData.tags = [];
      }
      return;
    }

    if (CLEARABLE_OPTIONAL_KEYS.has(key)) {
      if (value === undefined || value === null) {
        if (clearEmptyOptionals) requestData[key] = "";
        return;
      }
      if (typeof value === "string" && value.trim() === "") {
        if (clearEmptyOptionals) requestData[key] = "";
        return;
      }
      requestData[key] = value;
      return;
    }

    if (value === undefined || value === null) return;
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

  if (data.clinicImages?.length && allowedFields.has("clinicImages")) {
    data.clinicImages.forEach((item, index) => {
      if (
        item instanceof File ||
        (typeof item === "string" && item.trim().length > 0)
      ) {
        formData.append(`clinicImages[${index}]`, item);
      }
    });
  }

  if (data.certificates?.length) {
    const certificatesData = data.certificates.map((cert, index) => {
      if (cert.certificateImage) {
        formData.append(`certificateImages[${index}]`, cert.certificateImage);
      }

      const { certificateImage: _image, ...rest } = cert;
      return rest;
    });

    formData.append("certificates", JSON.stringify(certificatesData));
  } else if (
    clearEmptyOptionals &&
    data.certificates !== undefined &&
    allowedFields.has("certificates")
  ) {
    formData.append("certificates", JSON.stringify([]));
  }

  return formData;
}

export { SPECIALIST_ALLOWED_FIELDS };
