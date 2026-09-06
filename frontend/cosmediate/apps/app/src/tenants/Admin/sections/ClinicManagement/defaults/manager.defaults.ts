import { ManagerFormValues } from "../types/manager.types";

export const defaultManagerFormValues: ManagerFormValues = {
  managerImage: undefined,
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: undefined,
  gender: undefined,
  country: undefined,
  state: undefined,
  city: undefined,
  postalCode: undefined,
  completeAddress: undefined,
  // Force explicit status selection on create
  status: undefined as unknown as ManagerFormValues["status"],
  // Create uses clinicId (single); update uses clinicIds (multi)
  clinicId: undefined as unknown as string,
  clinicIds: undefined,
  perms: [],
};
