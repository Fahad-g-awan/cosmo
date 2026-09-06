import {
  WorkingHoursDay,
  WorkingHoursItem,
} from "@cosmediate/type-utils/shared";

export const SPECIALIST_ALLOWED_FIELDS = new Set([
  "specialistImage",
  "firstName",
  "lastName",
  "email",
  "phone",
  "age",
  "gender",
  "htmlAbout",
  "overview",
  "country",
  "state",
  "city",
  "postalCode",
  "completeAddress",

  "instagramId",
  "website",

  "faqs",
  "tags",
  "workingHours",
  "certificates",

  // Seeded for BE required fields — not editable in advance profile UI
  "status",
  "available",
  "workingType",
  "parentClinicId",
  "clinicIds",
  "totalExperience",
]);

export const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Pending", value: "PENDING" },
  { label: "Unconfirmed", value: "UNCONFIRMED" },
];

export const WOKING_TYPE_OPTIONS = [
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Freelance", value: "FREELANCE" },
];

export const ALL_DAYS: WorkingHoursDay[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DEFAULT_WORKING_HOURS: WorkingHoursItem[] = ALL_DAYS.map(
  (day) => ({
    weekDay: day,
    startTime: "09:00",
    endTime: "17:00",
    available: false,
  })
);

export const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];
