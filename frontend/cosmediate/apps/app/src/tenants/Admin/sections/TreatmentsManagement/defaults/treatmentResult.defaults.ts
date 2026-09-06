import { TreatmentResultFormValues } from "../types/treatmentResult.types";

export const defaultTreatmentResultFormValues: TreatmentResultFormValues = {
  treatmentId: "",
  // Empty until upload — Zod still requires images on submit
  beforeImage: undefined as unknown as TreatmentResultFormValues["beforeImage"],
  afterImage: undefined as unknown as TreatmentResultFormValues["afterImage"],
  description: "",
};
