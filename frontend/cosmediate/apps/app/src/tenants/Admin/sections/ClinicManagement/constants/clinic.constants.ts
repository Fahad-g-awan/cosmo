import {
  WorkingHoursDay,
  WorkingHoursItem,
} from "@cosmediate/type-utils/shared";

export const ALLOWED_FIELDS = new Set([
  "clinicLogo",
  "clinicImages",
  "name",
  "phone",
  "email",
  "categories",
  "htmlAbout",
  "overview",
  "clinicAge",
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

  "clinicType",
  "status",
  "available",

  "parentClinicId",
  "managerIds",

  "managerEmail",
  "managerFirstName",
  "managerLastName",
  "managerPhone",
]);

export const STATUS_OPTIONS = [
  { label: "Active", value: "ACTIVE" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Pending", value: "PENDING" },
  { label: "Unconfirmed", value: "UNCONFIRMED" },
];

export const CLINIC_TYPE_OPTIONS = [
  { label: "Parent Clinic", value: "PARENT" },
  { label: "Branch/Node Clinic", value: "NODE" },
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
