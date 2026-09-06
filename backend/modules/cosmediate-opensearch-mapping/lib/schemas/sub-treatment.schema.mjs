import { kw, text, textAC, Boolean, Float } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildSubTreatmentMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      clinicTreatmentId: kw(),
      clinicId: kw(),
      treatmentId: kw(),
      categoryId: kw(),
      categoryName: text({ fields: { keyword: { type: "keyword" } } }),
      clinicTreatmentStatus: kw(),
      name: textAC(),
      price: Float(),
      duration: kw(),
      available: Boolean(),
      brandIds: kw(),
    },
  },
});
