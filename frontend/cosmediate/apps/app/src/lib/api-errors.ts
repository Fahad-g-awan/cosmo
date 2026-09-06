import { Toaster } from "@cosmediate/ui";
import type { FormErrors } from "@cosmediate/form-core";

export interface ApiFailureLike {
  success?: boolean;
  message?: string;
  error?: string;
  details?: string[] | null;
}

export type FormApiRef = {
  setApiErrors: (
    response: ApiFailureLike,
    fieldMap?: Record<string, string>,
  ) => number;
};

export const BLOG_FORM_FIELD_MAP: Record<string, string> = {
  image: "blogImage",
  blogImage: "blogImage",
  title: "title",
  overview: "overview",
  content: "content",
  status: "status",
  publishedAt: "publishedAt",
  tags: "tags",
  categoryId: "categoryId",
};

export const BLOG_CATEGORY_FIELD_MAP: Record<string, string> = {
  name: "names",
  categories: "names",
  published: "published",
};

export const ANNOUNCEMENT_FORM_FIELD_MAP: Record<string, string> = {
  title: "title",
  message: "message",
  severity: "severity",
  status: "status",
  priority: "priority",
  startsAt: "startsAt",
  endsAt: "endsAt",
  dismissible: "dismissible",
  targetRoles: "targetRoles",
  targetSurfaces: "targetSurfaces",
  actionLabel: "actionLabel",
  actionUrl: "actionUrl",
  label: "actionLabel",
  url: "actionUrl",
};

export const TREATMENT_FORM_FIELD_MAP: Record<string, string> = {
  image: "treatmentImage",
  treatmentImage: "treatmentImage",
  categoryId: "categoryId",
  name: "name",
  overview: "overview",
  recoveryTime: "recoveryTime",
  anesthesia: "anesthesia",
  htmlDescription: "htmlDescription",
  published: "published",
  tags: "tags",
  faqs: "faqs",
};

export const PATIENT_FORM_FIELD_MAP: Record<string, string> = {
  image: "patientImage",
  patientImage: "patientImage",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phone: "phone",
  age: "age",
  gender: "gender",
  country: "country",
  state: "state",
  city: "city",
  postalCode: "postalCode",
  completeAddress: "completeAddress",
};

export const SPECIALIST_FORM_FIELD_MAP: Record<string, string> = {
  image: "specialistImage",
  specialistImage: "specialistImage",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phone: "phone",
  age: "age",
  gender: "gender",
  totalExperience: "totalExperience",
  country: "country",
  state: "state",
  city: "city",
  postalCode: "postalCode",
  completeAddress: "completeAddress",
  parentClinicId: "parentClinicId",
  clinicIds: "clinicIds",
  workingType: "workingType",
  status: "status",
  available: "available",
  overview: "overview",
  workingHours: "workingHours",
  certificates: "certificates",
  faqs: "faqs",
  tags: "tags",
  htmlAbout: "htmlAbout",
};

export const MANAGER_FORM_FIELD_MAP: Record<string, string> = {
  image: "managerImage",
  managerImage: "managerImage",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phone: "phone",
  age: "age",
  gender: "gender",
  country: "country",
  state: "state",
  city: "city",
  postalCode: "postalCode",
  completeAddress: "completeAddress",
  clinicIds: "clinicIds",
  clinicId: "clinicId",
};

export const ADMIN_FORM_FIELD_MAP: Record<string, string> = {
  image: "adminImage",
  adminImage: "adminImage",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phone: "phone",
  age: "age",
  gender: "gender",
  country: "country",
  state: "state",
  city: "city",
  postalCode: "postalCode",
  completeAddress: "completeAddress",
};

export const TREATMENT_RESULT_FORM_FIELD_MAP: Record<string, string> = {
  beforeImage: "beforeImage",
  afterImage: "afterImage",
  image: "beforeImage",
  description: "description",
  treatmentId: "treatmentId",
  clinicTreatmentId: "clinicTreatmentId",
};

export const CLINIC_CATEGORY_FIELD_MAP: Record<string, string> = {
  name: "names",
  categories: "names",
};

export const TREATMENT_CATEGORY_FIELD_MAP: Record<string, string> = {
  name: "names",
  categories: "names",
};

export const TREATMENT_BRAND_FIELD_MAP: Record<string, string> = {
  name: "names",
  brands: "names",
};

export const CLINIC_FORM_FIELD_MAP: Record<string, string> = {
  email: "email",
  logo: "clinicLogo",
  clinicLogo: "clinicLogo",
  images: "clinicImages",
  clinicImages: "clinicImages",
  categoryIds: "categories",
  categories: "categories",
  overview: "overview",
  workingHours: "workingHours",
  certificates: "certificates",
  faqs: "faqs",
  tags: "tags",
  managerEmail: "newManager.email",
  managerFirstName: "newManager.firstName",
  managerLastName: "newManager.lastName",
  managerPhone: "newManager.phone",
  managerStatus: "newManager.status",
};

export const BULK_NAMES_FIELD_MAP: Record<string, string> = {
  categories: "names",
  brands: "names",
};

export function getApiFailureMessage(
  response: ApiFailureLike,
  fallback = "Something went wrong, please try again.",
): string {
  const details = response.details?.filter(
    (entry): entry is string => typeof entry === "string" && entry.trim() !== "",
  );
  const firstDetail = details?.[0]?.trim();

  const genericMessages = new Set([
    "invalid request data",
    "validation failed",
    "bad request",
    "not found",
    "conflict",
    "schema error",
    "something went wrong, please try again.",
    "an error occurred while creating data",
    "an error occurred while updating data",
    "an error occurred while deleting data",
  ]);

  if (typeof response.message === "string" && response.message.trim()) {
    const message = response.message.trim();
    if (firstDetail && genericMessages.has(message.toLowerCase())) {
      return details!.length > 1
        ? details!.map((entry) => entry.trim()).join("\n")
        : firstDetail;
    }
    return message;
  }

  if (firstDetail) {
    return details!.length > 1
      ? details!.map((entry) => entry.trim()).join("\n")
      : firstDetail;
  }

  if (typeof response.error === "string" && response.error.trim()) {
    return response.error.trim();
  }

  return fallback;
}

export function showApiFailureToast(
  response: ApiFailureLike,
  title: string,
  descriptionFallback?: string,
): void {
  Toaster(title, "error", getApiFailureMessage(response, descriptionFallback));
}

export const CRUD_SUCCESS_REFRESH_HINT =
  "Changes should appear shortly. Refresh the page if you don't see them yet.";

export function showCrudSuccessToast(message: string): void {
  Toaster(message, "success", CRUD_SUCCESS_REFRESH_HINT);
}

const FORM_IMAGE_FIELD_PRIORITY = [
  "clinicImages",
  "clinicLogo",
  "blogImage",
  "treatmentImage",
  "beforeImage",
  "afterImage",
  "specialistImage",
  "patientImage",
  "managerImage",
  "adminImage",
] as const;

function resolveUploadFieldPath(fieldMap?: Record<string, string>): string {
  if (!fieldMap) return "_form";

  const mappedPaths = new Set(Object.values(fieldMap));
  for (const path of FORM_IMAGE_FIELD_PRIORITY) {
    if (mappedPaths.has(path)) return path;
  }

  return "_form";
}

const parseDetailLine = (
  detail: string,
  fieldMap?: Record<string, string>,
): { path: string; message: string } | null => {
  const trimmed = detail.trim();
  if (!trimmed) return null;

  const slashMatch = trimmed.match(/^(\/[\w./[\]-]+)\s+(.+)$/);
  if (slashMatch?.[1] && slashMatch[2]) {
    const rawPath = slashMatch[1].slice(1).replace(/\//g, ".");
    const rootKey = rawPath.split(".")[0] ?? rawPath;
    const path =
      fieldMap?.[rawPath] ?? fieldMap?.[rootKey] ?? rawPath;
    return { path, message: slashMatch[2] };
  }

  const rootMatch = trimmed.match(/^\(root\)\s+(.+)$/);
  if (rootMatch?.[1]) {
    const requiredMatch = rootMatch[1].match(/required property '([^']+)'/);
    if (requiredMatch?.[1]) {
      const rawPath = requiredMatch[1];
      return {
        path: fieldMap?.[rawPath] ?? rawPath,
        message: rootMatch[1],
      };
    }
    return { path: "_form", message: rootMatch[1] };
  }

  if (/invalid file type|file too large|exceeds.*limit/i.test(trimmed)) {
    return {
      path: resolveUploadFieldPath(fieldMap),
      message: trimmed,
    };
  }

  if (/certificate/i.test(trimmed)) {
    return {
      path: fieldMap?.certificates ?? "certificates",
      message: trimmed,
    };
  }

  if (/category already exists/i.test(trimmed)) {
    return {
      path: fieldMap?.name ?? fieldMap?.categories ?? "names",
      message: trimmed,
    };
  }

  if (/brand already exists/i.test(trimmed)) {
    return {
      path: fieldMap?.name ?? fieldMap?.brands ?? "names",
      message: trimmed,
    };
  }

  if (/clinic with this email|clinic already exists/i.test(trimmed)) {
    return {
      path: fieldMap?.email ?? "email",
      message: trimmed,
    };
  }

  if (
    /manager account with this email|manager already exists|already used by another user/i.test(
      trimmed,
    )
  ) {
    return {
      path: fieldMap?.managerEmail ?? fieldMap?.email ?? "newManager.email",
      message: trimmed,
    };
  }

  return { path: "_form", message: trimmed };
};

export function parseApiDetailsToFormErrors(
  details?: string[] | null,
  fieldMap?: Record<string, string>,
): FormErrors {
  if (!details?.length) return {};

  const errors: FormErrors = {};

  for (const detail of details) {
    const parsed = parseDetailLine(detail, fieldMap);
    if (!parsed) continue;
    if (!errors[parsed.path]) {
      errors[parsed.path] = parsed.message;
    }
  }

  return errors;
}

/** Paths that are not visible field highlights (toast should not say "fix fields"). */
function countHighlightableFieldErrors(errors: FormErrors): number {
  return Object.keys(errors).filter((path) => path !== "_form").length;
}

export function applyApiFailureToForm(
  setErrors: (errors: FormErrors) => void,
  response: ApiFailureLike,
  fieldMap?: Record<string, string>,
): number {
  // Server schema/compile failures are not user-correctable field errors.
  if (response.error === "schema_error") {
    return 0;
  }

  const fieldErrors = parseApiDetailsToFormErrors(response.details, fieldMap);
  const highlightableCount = countHighlightableFieldErrors(fieldErrors);

  if (highlightableCount > 0) {
    const visibleErrors = Object.fromEntries(
      Object.entries(fieldErrors).filter(([path]) => path !== "_form"),
    );
    setErrors(visibleErrors);
  }

  return highlightableCount;
}

export function handleCrudMutationResult(
  response: ApiFailureLike,
  options: {
    formRef?: { current: FormApiRef | null };
    fieldMap?: Record<string, string>;
    successMessage: string;
    errorTitle: string;
    validationErrorTitle?: string;
    onSuccess?: () => void;
  },
): boolean {
  if (response.success) {
    showCrudSuccessToast(options.successMessage);
    options.onSuccess?.();
    return true;
  }

  if (response.error === "schema_error") {
    Toaster(
      options.errorTitle,
      "error",
      "Something went wrong, please try again.",
    );
    return false;
  }

  const fieldErrorCount =
    options.formRef?.current?.setApiErrors(response, options.fieldMap) ?? 0;

  showApiFailureToast(
    response,
    fieldErrorCount > 0
      ? (options.validationErrorTitle ?? "Please fix the highlighted fields")
      : options.errorTitle,
  );

  return false;
}

function deleteFailureTitle(
  response: ApiFailureLike,
  errorTitle: string,
  notFoundTitle = "This item no longer exists",
): string {
  return response.error === "not_found" ? notFoundTitle : errorTitle;
}

export async function handleListDeleteResult(
  response: ApiFailureLike,
  options: {
    successMessage: string;
    errorTitle: string;
    /** Toast title when the row is already gone (stale OpenSearch list). */
    notFoundTitle?: string;
    refetch: () => Promise<void>;
    closeDialog: () => void;
  },
): Promise<boolean> {
  if (response.success) {
    showCrudSuccessToast(options.successMessage);
    await options.refetch();
    options.closeDialog();
    return true;
  }

  showApiFailureToast(
    response,
    deleteFailureTitle(response, options.errorTitle, options.notFoundTitle),
  );

  // Stale search hit: close and refresh so the ghost row disappears.
  if (response.error === "not_found") {
    await options.refetch();
    options.closeDialog();
  }

  return false;
}

export async function handleDetailDeleteResult(
  response: ApiFailureLike,
  options: {
    successMessage: string;
    errorTitle: string;
    notFoundTitle?: string;
    closeDialog: () => void;
    onSuccess: () => void;
  },
): Promise<boolean> {
  if (response.success) {
    showCrudSuccessToast(options.successMessage);
    options.closeDialog();
    options.onSuccess();
    return true;
  }

  showApiFailureToast(
    response,
    deleteFailureTitle(response, options.errorTitle, options.notFoundTitle),
  );

  if (response.error === "not_found") {
    options.closeDialog();
    options.onSuccess();
  }

  return false;
}
