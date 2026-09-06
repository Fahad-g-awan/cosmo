import { kw, text, textAC, Float } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildClinicTreatmentMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      clinicId: kw(),
      treatmentId: kw(),
      categoryId: kw(),
      categoryName: text({ fields: { keyword: { type: "keyword" } } }),
      treatmentName: textAC(),
      treatmentImage: kw(),
      treatmentOverview: text(),
      status: kw(),
      avgPrice: Float(),
      minPrice: Float(),
      maxPrice: Float(),
    },
  },
});
