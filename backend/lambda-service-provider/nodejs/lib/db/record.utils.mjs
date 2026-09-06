import { v4 as uuidv4 } from "uuid";

export const generateId = () => {
  const numericId = uuidv4().replace(/\D/g, "").slice(0, 12);

  const array = numericId.split("");

  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array.join("");
};

export const generateLookupKey = (str) => {
  if (!str) return "";

  // For emails, use the full email as lookup key (prevents collisions)
  if (/^[^@]+@[^@]+$/.test(str)) {
    return str.trim().toLowerCase();
  }

  // For other strings, use the sanitized version
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_");
};
