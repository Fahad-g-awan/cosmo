import {
  MANAGER_FORM_FIELD_MAP,
  SPECIALIST_FORM_FIELD_MAP,
} from "@app/lib/api-errors";

export type AccountProfileRole = "MANAGER" | "SPECIALIST";

export const MANAGER_ALLOWED_FIELDS = new Set([
  "managerImage",
  "firstName",
  "lastName",
  "phone",
  "email",
  "age",
  "gender",
  "country",
  "state",
  "city",
  "postalCode",
  "completeAddress",
  "status",
]);

export const SPECIALIST_ALLOWED_FIELDS = new Set([
  "specialistImage",
  "firstName",
  "lastName",
  "phone",
  "email",
  "age",
  "gender",
  "country",
  "state",
  "city",
  "postalCode",
  "completeAddress",
  "status",
]);

export const getAllowedFields = (role: AccountProfileRole) =>
  role === "SPECIALIST" ? SPECIALIST_ALLOWED_FIELDS : MANAGER_ALLOWED_FIELDS;

export const getImageField = (role: AccountProfileRole) =>
  role === "SPECIALIST" ? "specialistImage" : "managerImage";

export const getProfileFieldMap = (role: AccountProfileRole) =>
  role === "SPECIALIST" ? SPECIALIST_FORM_FIELD_MAP : MANAGER_FORM_FIELD_MAP;

export const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];
