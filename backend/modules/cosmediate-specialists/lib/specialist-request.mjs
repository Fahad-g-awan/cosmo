import { API_ERRORS } from "/opt/nodejs/constants/errors/index.mjs";
import { httpError } from "/opt/nodejs/lib/errors/http-error.mjs";

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

/**
 * Normalizes multipart specialist create/update bodies: attaches optional
 * certificate images by index (same pattern as clinic).
 *
 * @param {object} normalizedBody
 * @returns {object}
 */
export const normalizeSpecialistMultipartBody = (normalizedBody) => {
  const certificateImageMap = extractIndexedMap(
    normalizedBody,
    "certificateImages",
  );

  for (const key of Object.keys(normalizedBody)) {
    if (key.startsWith("certificateImages[")) {
      delete normalizedBody[key];
    }
  }

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
