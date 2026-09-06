import { normalizePhone } from "@app/lib/phone";

import { ALLOWED_FIELDS } from "../constants/specialist.constants";
import { SpecialistFormValues } from "../types/specialist.types";

export type BuildSpecialistFormDataOptions = {
  clinicDashboard?: boolean;
  activeClinicId?: string;
  isUpdate?: boolean;
};

export const buildSpecialistFormData = (
  data: Partial<SpecialistFormValues>,
  extra: Record<string, unknown> = {},
  options: BuildSpecialistFormDataOptions = {},
): FormData => {
  const requestData: Record<string, unknown> = { ...extra };

  Object.entries(data).forEach(([key, value]) => {
    if (key === "phone") {
      const phone = normalizePhone(value);
      if (phone) requestData.phone = phone;
      return;
    }

    if (key === "certificates") return;
    if (key === "parentClinicId" || key === "clinicIds") return;

    if (key === "faqs") {
      const faqs = Array.isArray(value)
        ? value.filter(
            (
              faq,
            ): faq is NonNullable<SpecialistFormValues["faqs"]>[number] => {
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
      if (faqs.length > 0) requestData.faqs = faqs;
      return;
    }

    if (key === "tags") {
      if (Array.isArray(value) && value.length > 0) {
        requestData.tags = value;
      }
      return;
    }

    if (ALLOWED_FIELDS.has(key) && value !== undefined && value !== null) {
      if (typeof value === "string" && value.trim() === "") return;
      requestData[key] = value;
    }
  });

  if (options.clinicDashboard && options.activeClinicId) {
    requestData.activeClinicId = options.activeClinicId;
    requestData.workingType = "FULL_TIME";
    delete requestData.clinicIds;

    if (!options.isUpdate) {
      requestData.parentClinicId = options.activeClinicId;
    } else if (data.parentClinicId) {
      requestData.parentClinicId = data.parentClinicId;
    }
  } else {
    if (data.workingType === "FULL_TIME" && data.parentClinicId) {
      requestData.parentClinicId = data.parentClinicId;
    }

    if (
      data.workingType === "FREELANCE" &&
      Array.isArray(data.clinicIds) &&
      data.clinicIds.length > 0
    ) {
      requestData.clinicIds = data.clinicIds;
    }
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

  return formData;
};
