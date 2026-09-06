import { TreatmentFormValues } from "../types/treatment.types";

export const defaultTreatmentFormValues: TreatmentFormValues = {
  name: "",
  categoryId: "",
  overview: "",
  published: true,
  recoveryTime: "",
  anesthesia: "",
  htmlDescription: { type: "doc", content: [] },
  faqs: [
    {
      question: "",
      answer: { type: "doc", content: [] },
    },
  ],
  tags: [],
  // Empty until upload — Zod still requires an image on submit
  treatmentImage: undefined as unknown as TreatmentFormValues["treatmentImage"],
};
