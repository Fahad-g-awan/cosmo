import { WorkingHoursItem } from "@cosmediate/type-utils/shared";
import { ClinicFormValues } from "../types/clinic.types";

export const defaultClinicFormValues: ClinicFormValues = {
  // Force explicit selection on create (shows field errors when left empty)
  clinicType: undefined as unknown as ClinicFormValues["clinicType"],
  name: "",
  email: "",
  phone: "",
  status: undefined as unknown as ClinicFormValues["status"],
  // Switch off = false (do not use undefined — looks off but fails Zod)
  available: false,
  // Optional string fields - use undefined instead of empty strings
  clinicAge: undefined,
  overview: "",
  instagramId: undefined,
  website: undefined,
  country: undefined,
  state: undefined,
  city: undefined,
  completeAddress: undefined,
  postalCode: undefined,
  // Optional arrays - use undefined instead of empty arrays
  tags: undefined,
  categories: [],
  parentClinicId: undefined,
  managerIds: undefined,
  // Complex types
  htmlAbout: undefined,
  workingHours: [
    {
      weekDay: "monday",
      startTime: "09:00",
      endTime: "17:00",
      available: true,
    },
    {
      weekDay: "tuesday",
      startTime: "09:00",
      endTime: "17:00",
      available: true,
    },
    {
      weekDay: "wednesday",
      startTime: "09:00",
      endTime: "17:00",
      available: true,
    },
    {
      weekDay: "thursday",
      startTime: "09:00",
      endTime: "17:00",
      available: true,
    },
    {
      weekDay: "friday",
      startTime: "09:00",
      endTime: "17:00",
      available: true,
    },
    {
      weekDay: "saturday",
      startTime: "09:00",
      endTime: "17:00",
      available: false,
    },
    {
      weekDay: "sunday",
      startTime: "09:00",
      endTime: "17:00",
      available: false,
    },
  ] as WorkingHoursItem[],
  faqs: [],
  certificates: undefined,
  newManager: undefined,
};
