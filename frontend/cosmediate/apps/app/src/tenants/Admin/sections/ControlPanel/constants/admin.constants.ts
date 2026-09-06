export const ALLOWED_FIELDS = new Set([
  "adminImage",
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
  "perms",
]);

export const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

export const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Pending", value: "PENDING" },
  { label: "Unconfirmed", value: "UNCONFIRMED" },
];

