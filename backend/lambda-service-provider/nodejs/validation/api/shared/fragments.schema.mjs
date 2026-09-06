import { GRANT_REGISTRY } from "../../../constants/auth/permissions/index.mjs";
import { SUPER_ACCESS_GRANT } from "../../../config/auth/super-access.mjs";
import { Boolean, String, URI } from "./primitives.schema.mjs";

export const phone = {
  type: "string",
  minLength: 5,
  maxLength: 16,
  pattern: "^\\+[1-9]\\d{1,14}$",
  errorMessage: {
    pattern:
      "Phone must be in international format with country code (e.g. +15551234567)",
    minLength:
      "Phone must be in international format with country code (e.g. +15551234567)",
    maxLength: "Phone number is too long",
  },
};

/** Optional phone — empty / null clears; otherwise must be E.164. */
export const clearablePhone = {
  anyOf: [
    { type: "null" },
    { type: "string", maxLength: 0 },
    phone,
  ],
};

export const email = { type: "string", format: "email", maxLength: 254 };

export const password = {
  type: "string",
  minLength: 8,
  maxLength: 128,
  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$",
  errorMessage: {
    pattern:
      "Password must contain uppercase, lowercase, number, and special character",
  },
};

/** Cognito email/SMS codes — must be a string (not JSON number) to preserve leading zeros. */
export const verificationCode = {
  type: "string",
  minLength: 4,
  maxLength: 10,
  pattern: "^[0-9]+$",
  errorMessage: {
    type: "Verification code must be sent as a string",
    pattern: "Verification code must contain digits only",
  },
};

export const htmlBlob = {
  type: "object",
  required: ["type", "content"],
  properties: {
    type: { const: "doc" },
    content: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        required: ["type"],
        properties: {
          type: { type: "string" },
          content: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                text: { type: "string" },
              },
              additionalProperties: true,
            },
          },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: false,
};

export const perms = {
  type: "array",
  items: { type: "string", enum: GRANT_REGISTRY },
  uniqueItems: true,
  default: [],
};

export const permsAdminGrantable = {
  type: "array",
  items: {
    type: "string",
    enum: [...GRANT_REGISTRY, SUPER_ACCESS_GRANT],
  },
  uniqueItems: true,
  default: [],
};

export const faqs = {
  type: "array",
  minItems: 0,
  items: {
    type: "object",
    required: ["question", "answer"],
    properties: {
      question: String,
      answer: htmlBlob,
    },
    additionalProperties: false,
  },
};
export const tags = {
  type: "array",
  items: {
    type: "string",
    minLength: 3,
    maxLength: 500,
    pattern: "\\S",
    errorMessage: {
      minLength: "Each tag must be at least 3 characters",
      maxLength: "Tag is too long",
      pattern: "Tag cannot be empty or whitespace only",
    },
  },
  minItems: 0,
};
const workingHourTime = {
  type: "string",
  pattern: "^(?:[01]\\d|2[0-3]):[0-5]\\d$",
  errorMessage: "Time must be in HH:mm format",
};

export const workingHours = {
  type: "array",
  minItems: 1,
  items: {
    type: "object",
    required: ["weekDay", "available"],
    properties: {
      weekDay: String,
      available: Boolean,
      startTime: workingHourTime,
      endTime: workingHourTime,
    },
    allOf: [
      {
        if: { properties: { available: { const: true } } },
        // AJV strictRequired: properties must be declared on the same schema
        // node that lists them in `required` (not only on the parent object).
        then: {
          required: ["startTime", "endTime"],
          properties: {
            startTime: workingHourTime,
            endTime: workingHourTime,
          },
        },
      },
    ],
    additionalProperties: false,
  },
};
export const certificates = {
  type: "array",
  minItems: 0,
  items: {
    type: "object",
    required: [
      "name",
      "number",
      "issueDate",
      "validTill",
      "email",
      "certificateHolderFirstName",
      "certificateHolderLastName",
    ],
    properties: {
      certificateImage: URI,
      name: String,
      number: String,
      issueDate: String,
      validTill: String,
      email,
      certificateHolderFirstName: String,
      certificateHolderLastName: String,
    },
    additionalProperties: false,
  },
};
