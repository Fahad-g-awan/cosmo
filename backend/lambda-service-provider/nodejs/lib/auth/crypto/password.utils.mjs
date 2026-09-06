import crypto from "crypto";

const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercase = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
const special = "!@#$%^&*()_+[]{}|;:,.<>?";

const all = uppercase + lowercase + digits + special;

const pick = (chars) => chars[crypto.randomInt(0, chars.length)];

/**
 * Generates a default password using a random byte array.
 *
 * @param {number} length - The length of the password.
 * @returns {string} The password.
 */
export const generateDefaultPassword = (length = 12) => {
  const password = [
    pick(uppercase),
    pick(lowercase),
    pick(digits),
    pick(special),
  ];

  for (let i = password.length; i < length; i++) {
    password.push(pick(all));
  }

  return password.sort(() => crypto.randomInt(-1, 2)).join("");
};
