import { WorkingHoursItem } from "@cosmediate/type-utils/shared";
import { SpecialistFormValues } from "../types/specialist.types";

export const defaultSpecialistFormValues: SpecialistFormValues = {
  // Force explicit selection on create
  workingType: undefined as unknown as SpecialistFormValues["workingType"],
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: undefined,
  gender: undefined,
  status: undefined as unknown as SpecialistFormValues["status"],
  // Switch off = false (do not use undefined — looks off but fails Zod)
  available: false,
  perms: [],
  totalExperience: undefined,
  overview: "",
  instagramId: undefined,
  website: undefined,
  country: undefined,
  state: undefined,
  city: undefined,
  completeAddress: undefined,
  postalCode: undefined,
  tags: undefined,
  specialistImage: undefined,

  clinicIds: undefined,
  parentClinicId: undefined,

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
  faqs: undefined,
  certificates: undefined,
};
