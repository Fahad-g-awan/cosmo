/**
 * Short-lived AES-GCM bridge for the signup → confirm-signup flow.
 * Stores an encrypted password in sessionStorage so confirm can auto-sign-in
 * without leaving plaintext in storage. Not XSS-proof — obfuscation only.
 */

const CIPHERTEXT_KEY = "auth_new_signup_pw";
const KEY_MATERIAL_KEY = "auth_new_signup_pw_key";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const importAesKey = async (rawKeyBase64: string): Promise<CryptoKey> => {
  return crypto.subtle.importKey(
    "raw",
    base64ToBuffer(rawKeyBase64),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
};

/**
 * Remove encrypted signup password material from sessionStorage.
 */
export const clearSignupPasswordBridge = (): void => {
  try {
    sessionStorage.removeItem(CIPHERTEXT_KEY);
    sessionStorage.removeItem(KEY_MATERIAL_KEY);
  } catch {
    // sessionStorage may be unavailable — non-fatal.
  }
};

/**
 * Encrypt the signup password and store ciphertext + key in sessionStorage.
 *
 * @param password - Plaintext password from signup form
 */
export const storeEncryptedSignupPassword = async (
  password: string,
): Promise<void> => {
  if (typeof window === "undefined" || !password) return;

  try {
    const key = await crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    );
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      textEncoder.encode(password),
    );
    const rawKey = await crypto.subtle.exportKey("raw", key);
    // iv (12) + ciphertext packed together
    const packed = new Uint8Array(iv.length + ciphertext.byteLength);
    packed.set(iv, 0);
    packed.set(new Uint8Array(ciphertext), iv.length);

    sessionStorage.setItem(CIPHERTEXT_KEY, bufferToBase64(packed.buffer));
    sessionStorage.setItem(KEY_MATERIAL_KEY, bufferToBase64(rawKey));
  } catch {
    clearSignupPasswordBridge();
  }
};

/**
 * Decrypt the bridged signup password for a confirm request.
 * Does not clear storage — caller clears after successful confirm.
 *
 * @returns Plaintext password, or null if missing/corrupt
 */
export const takeDecryptedSignupPassword = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    const packedBase64 = sessionStorage.getItem(CIPHERTEXT_KEY);
    const keyBase64 = sessionStorage.getItem(KEY_MATERIAL_KEY);
    if (!packedBase64 || !keyBase64) return null;

    const packed = new Uint8Array(base64ToBuffer(packedBase64));
    if (packed.length <= 12) return null;

    const iv = packed.slice(0, 12);
    const ciphertext = packed.slice(12);
    const key = await importAesKey(keyBase64);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return textDecoder.decode(plaintext);
  } catch {
    clearSignupPasswordBridge();
    return null;
  }
};
