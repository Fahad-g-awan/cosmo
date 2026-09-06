/**
 * Shared form field limits — reuse across clinic, specialist, treatment, etc.
 */
export const OVERVIEW_MAX_LENGTH = 300;
export const OVERVIEW_MIN_LENGTH = 10;

export const ENTITY_NAME_MIN_LENGTH = 2;
export const ENTITY_NAME_MAX_LENGTH = 100;

export const PLACEHOLDER_IMAGE_SRC = "/placeholder.jpg";
export const AVATAR_IMAGE_SRC = "/avatar.jpg";

/**
 * Load a public asset as a File (e.g. default placeholder upload).
 */
export async function fileFromPublicAsset(
  src: string,
  filename: string,
): Promise<File> {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to load ${src}`);
  }
  const blob = await response.blob();
  return new File([blob], filename, {
    type: blob.type || "image/jpeg",
  });
}

const hasUploadableImage = (value: unknown): boolean => {
  if (value instanceof File) return true;
  return typeof value === "string" && value.trim().length > 0;
};

/**
 * Standalone manager forms: fill missing profile image with the public avatar.
 */
export async function withManagerImagePlaceholder<
  T extends { managerImage?: string | File | null },
>(data: T): Promise<T> {
  if (hasUploadableImage(data.managerImage)) return data;

  return {
    ...data,
    managerImage: await fileFromPublicAsset(
      AVATAR_IMAGE_SRC,
      "manager-avatar-placeholder.jpg",
    ),
  };
}

/**
 * Standalone patient forms: fill missing profile image with the public avatar.
 */
export async function withPatientImagePlaceholder<
  T extends { patientImage?: string | File | null },
>(data: T): Promise<T> {
  if (hasUploadableImage(data.patientImage)) return data;

  return {
    ...data,
    patientImage: await fileFromPublicAsset(
      AVATAR_IMAGE_SRC,
      "patient-avatar-placeholder.jpg",
    ),
  };
}

/**
 * Standalone admin forms: fill missing profile image with the public avatar.
 */
export async function withAdminImagePlaceholder<
  T extends { adminImage?: string | File | null },
>(data: T): Promise<T> {
  if (hasUploadableImage(data.adminImage)) return data;

  return {
    ...data,
    adminImage: await fileFromPublicAsset(
      AVATAR_IMAGE_SRC,
      "admin-avatar-placeholder.jpg",
    ),
  };
}

/**
 * Standalone specialist forms: fill missing profile image with the public avatar.
 */
export async function withSpecialistImagePlaceholder<
  T extends { specialistImage?: string | File | null },
>(data: T): Promise<T> {
  if (hasUploadableImage(data.specialistImage)) return data;

  return {
    ...data,
    specialistImage: await fileFromPublicAsset(
      AVATAR_IMAGE_SRC,
      "specialist-avatar-placeholder.jpg",
    ),
  };
}

/**
 * Standalone treatment forms: fill missing image with the public placeholder.
 */
export async function withTreatmentImagePlaceholder<
  T extends { treatmentImage?: string | File | null },
>(data: T): Promise<T> {
  if (hasUploadableImage(data.treatmentImage)) return data;

  return {
    ...data,
    treatmentImage: await fileFromPublicAsset(
      PLACEHOLDER_IMAGE_SRC,
      "treatment-image-placeholder.jpg",
    ),
  };
}

