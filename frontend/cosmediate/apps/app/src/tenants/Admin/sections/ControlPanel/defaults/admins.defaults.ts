import { AdminFormValues } from "../types/admin.types";

export const defaultAdminFormValues: AdminFormValues = {
  adminImage: undefined,
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
  status: undefined as unknown as AdminFormValues["status"],
  perms: [],
};
