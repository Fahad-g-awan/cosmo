import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

const extractIndexedArray = (obj, prefix) =>
  Object.entries(obj)
    .filter(([key]) => key.startsWith(`${prefix}[`))
    .sort(
      ([a], [b]) =>
        Number(a.match(/\[(\d+)\]/)[1]) - Number(b.match(/\[(\d+)\]/)[1]),
    )
    .map(([, value]) => value);

/**
 * Preserve sparse indexes so certificateImages[2] maps to certificates[2].
 *
 * @param {object} obj
 * @param {string} prefix
 * @returns {Map<number, unknown>}
 */
const extractIndexedMap = (obj, prefix) => {
  const map = new Map();
  for (const [key, value] of Object.entries(obj)) {
    if (!key.startsWith(`${prefix}[`)) continue;
    const match = key.match(/\[(\d+)\]/);
    if (!match) continue;
    map.set(Number(match[1]), value);
  }
  return map;
};

const mergeByIndex = (indexed, fallback = []) => {
  const maxLen = Math.max(indexed.length, fallback.length);
  return Array.from({ length: maxLen }, (_, i) =>
    indexed[i] !== undefined ? indexed[i] : fallback[i],
  );
};

/**
 * Normalizes multipart clinic create/update bodies: merges indexed image arrays
 * and attaches certificate images to certificate entries (image optional).
 *
 * @param {object} normalizedBody
 * @returns {object}
 */
export const normalizeClinicMultipartBody = (normalizedBody) => {
  const indexedClinicImages = extractIndexedArray(
    normalizedBody,
    "clinicImages",
  );
  const certificateImageMap = extractIndexedMap(
    normalizedBody,
    "certificateImages",
  );

  for (const key of Object.keys(normalizedBody)) {
    if (
      key.startsWith("clinicImages[") ||
      key.startsWith("certificateImages[")
    ) {
      delete normalizedBody[key];
    }
  }

  const clinicImages = mergeByIndex(
    indexedClinicImages,
    normalizedBody.clinicImages ?? [],
  );

  normalizedBody.clinicImages = clinicImages;

  const certificates = normalizedBody.certificates ?? [];
  if (!Array.isArray(certificates)) {
    throw httpError({
      error: API_ERRORS.BAD_REQUEST,
      message: "Invalid certificates payload",
      details: ["Certificates must be an array"],
    });
  }

  certificates.forEach((cert, index) => {
    if (certificateImageMap.has(index)) {
      cert.certificateImage = certificateImageMap.get(index);
    }
  });

  delete normalizedBody.certificateImages;
  return normalizedBody;
};
