import type { WorkingHoursItem } from "@cosmediate/type-utils/shared";

/**
 * Validate working hours: optional overall; if available, both times required;
 * if either time is set without the other, error; end must be after start.
 */
export function validateWorkingHours(
  hours: WorkingHoursItem[] | null | undefined,
): string | null {
  if (!hours?.length) return null;

  for (const day of hours) {
    const label = day.weekDay || "Day";
    const start = (day.startTime ?? "").trim();
    const end = (day.endTime ?? "").trim();
    const hasStart = start.length > 0;
    const hasEnd = end.length > 0;

    if (day.available) {
      if (!hasStart || !hasEnd) {
        return `${label}: start and end time are required when marked available`;
      }
    } else if (hasStart !== hasEnd) {
      return `${label}: provide both start and end time, or leave both empty`;
    }

    if (hasStart && hasEnd && start >= end) {
      return `${label}: end time must be after start time`;
    }
  }

  return null;
}

type CertificateLike = {
  name?: string;
  number?: string;
  issueDate?: string;
  validTill?: string;
  email?: string;
  certificateHolderFirstName?: string;
  certificateHolderLastName?: string;
  certificateImage?: File | string | null;
};

export function isBlankCertificate(cert: CertificateLike): boolean {
  return (
    !(cert.name ?? "").trim() &&
    !(cert.number ?? "").trim() &&
    !(cert.issueDate ?? "").trim() &&
    !(cert.validTill ?? "").trim() &&
    !(cert.email ?? "").trim() &&
    !(cert.certificateHolderFirstName ?? "").trim() &&
    !(cert.certificateHolderLastName ?? "").trim() &&
    !cert.certificateImage
  );
}

export type CertificateField =
  | "name"
  | "number"
  | "issueDate"
  | "validTill"
  | "email"
  | "certificateHolderFirstName"
  | "certificateHolderLastName";

/**
 * Image is optional; all other fields required when a certificate row is kept.
 * Returns per-field errors for dialog mapping (and schema summaries).
 */
export function validateCertificates(
  certificates: CertificateLike[],
): { index: number; field: CertificateField; message: string }[] {
  const errors: {
    index: number;
    field: CertificateField;
    message: string;
  }[] = [];

  certificates.forEach((cert, index) => {
    if (isBlankCertificate(cert)) return;

    const require = (field: CertificateField, label: string) => {
      if (!(cert[field] ?? "").trim()) {
        errors.push({ index, field, message: `${label} is required` });
      }
    };

    require("name", "Certificate name");
    require("number", "Certificate number");
    require("issueDate", "Issue date");
    require("validTill", "Valid till");
    require("email", "Email");
    require("certificateHolderFirstName", "Holder first name");
    require("certificateHolderLastName", "Holder last name");
  });

  return errors;
}

type FaqLike = {
  question?: string;
  answer?: { content?: unknown[] } | null;
};

function hasFaqAnswer(answer: FaqLike["answer"]): boolean {
  return Array.isArray(answer?.content) && answer.content.length > 0;
}

/**
 * FAQs are optional; if question is set answer is required and vice versa.
 */
export function validateFaqs(
  faqs: FaqLike[] | null | undefined,
): { index: number; field: "question" | "answer"; message: string }[] {
  if (!faqs?.length) return [];

  const errors: {
    index: number;
    field: "question" | "answer";
    message: string;
  }[] = [];

  faqs.forEach((faq, index) => {
    const question = (faq.question ?? "").trim();
    const answered = hasFaqAnswer(faq.answer);

    if (!question && !answered) return;

    if (question && !answered) {
      errors.push({
        index,
        field: "answer",
        message: `FAQ ${index + 1}: answer is required when question is provided`,
      });
    }
    if (answered && !question) {
      errors.push({
        index,
        field: "question",
        message: `FAQ ${index + 1}: question is required when answer is provided`,
      });
    }
  });

  return errors;
}
