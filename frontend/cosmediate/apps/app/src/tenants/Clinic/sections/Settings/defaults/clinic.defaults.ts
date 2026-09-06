import { WorkingHoursItem } from "@cosmediate/type-utils/shared";
import { ClinicFormValues } from "../types/clinic.types";

export const defaultClinicFormValues: ClinicFormValues = {
  workingType: undefined,
  firstName: "",
  lastName: "",
  age: undefined,
  gender: undefined,
  totalExperience: undefined,

  clinicType: undefined as unknown as ClinicFormValues["clinicType"],
  name: "",
  clinicAge: undefined,
  categories: [],

  email: "",
  phone: "",
  status: undefined as unknown as ClinicFormValues["status"],
  available: false,
  overview: "",
  instagramId: undefined,
  website: undefined,
  country: undefined,
  state: undefined,
  city: undefined,
  completeAddress: undefined,
  postalCode: undefined,

  tags: undefined,
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
