import { kw, text, textAC, Boolean, Float, Integer } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildClinicSpecialistTreatmentMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      clinicTreatmentId: kw(),
      clinicId: kw(),
      specialistId: kw(),
      treatmentId: kw(),
      categoryId: kw(),
      categoryName: text({ fields: { keyword: { type: "keyword" } } }),
      treatmentName: textAC(),
      treatmentImage: kw(),
      treatmentOverview: text(),
      specialistExperience: text(),
      status: kw(),
      clinicTreatmentStatus: kw(),
      available: Boolean(),
      brandIds: kw(),
      avgPrice: Float(),
      minPrice: Float(),
      maxPrice: Float(),
      searchClicks: Integer(),
    },
  },
});
