import { appendInlineManagerToFormData } from "./appendInlineManagerToFormData";
import { ALLOWED_FIELDS } from "../constants/clinic.constants";
import { ClinicFormValues } from "../types/clinic.types";
import { normalizePhone } from "@app/lib/phone";
import {
  fileFromPublicAsset,
  PLACEHOLDER_IMAGE_SRC,
} from "@app/lib/form-field-limits";

const hasUploadableImage = (value: unknown): boolean => {
  if (value instanceof File) return true;
  return typeof value === "string" && value.trim().length > 0;
};

const hasGalleryImages = (value: unknown): boolean =>
  Array.isArray(value) && value.some((item) => hasUploadableImage(item));

/**
 * On create, fill missing logo / gallery with the public placeholder asset
 * so clinics always persist at least one image each.
 */
export async function withClinicImagePlaceholders(
  data: Partial<ClinicFormValues>,
): Promise<Partial<ClinicFormValues>> {
  const next: Partial<ClinicFormValues> = { ...data };

  if (!hasUploadableImage(next.clinicLogo)) {
    next.clinicLogo = await fileFromPublicAsset(
      PLACEHOLDER_IMAGE_SRC,
      "clinic-logo-placeholder.jpg",
    );
  }

  if (!hasGalleryImages(next.clinicImages)) {
    next.clinicImages = [
      await fileFromPublicAsset(
        PLACEHOLDER_IMAGE_SRC,
        "clinic-gallery-placeholder.jpg",
      ),
    ];
  }

  return next;
}

export const buildClinicFormData = (
  data: Partial<ClinicFormValues>,
  extra: Record<string, unknown> = {},
): FormData => {
  const managerIds = data.managerIds?.filter(Boolean) ?? [];
  const hasManagerIds = managerIds.length > 0;
  const newManager = data.newManager;

  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (key === "newManager" || key === "managerIds") return;
    if (key === "clinicImages") return;

    if (key === "faqs") {
      const faqs = Array.isArray(value)
        ? value.filter((faq): faq is NonNullable<ClinicFormValues["faqs"]>[number] => {
            if (!faq || typeof faq !== "object" || !("question" in faq)) {
              return false;
            }
            const question = (faq.question ?? "").trim();
            const hasAnswer =
              Array.isArray(faq.answer?.content) &&
              faq.answer.content.length > 0;
            return question.length > 0 || hasAnswer;
          })
        : [];
      if (faqs.length > 0) requestData.faqs = faqs;
      return;
    }

    if (key === "certificates") {
      // Handled below with optional per-index images
      return;
    }

    if (key === "tags") {
      if (Array.isArray(value) && value.length > 0) {
        requestData.tags = value;
      }
      return;
    }

    if (key === "phone") {
      const phone =
        typeof value === "string" ? normalizePhone(value) : undefined;
      if (phone) requestData.phone = phone;
      return;
    }

    if (ALLOWED_FIELDS.has(key) && value !== undefined && value !== null) {
      if (typeof value === "string" && value.trim() === "") return;
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

  if (data.clinicImages?.length) {
    data.clinicImages.forEach((item, index) => {
      if (!hasUploadableImage(item)) return;
      formData.append(`clinicImages[${index}]`, item);
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
  }

  if (hasManagerIds) {
    formData.append("managerIds", JSON.stringify(managerIds));
  } else if (newManager) {
    appendInlineManagerToFormData(formData, newManager);
  }

  return formData;
};
