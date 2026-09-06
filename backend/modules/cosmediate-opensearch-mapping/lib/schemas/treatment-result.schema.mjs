import { kw, text, textAC } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildTreatmentResultMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      clinicTreatmentId: kw(),
      clinicTreatmentStatus: kw(),
      clinicId: kw(),
      treatmentId: kw(),
      categoryId: kw(),
      categoryName: text({ fields: { keyword: { type: "keyword" } } }),
      ownerType: kw(),
      beforeImage: kw(),
      afterImage: kw(),
      description: text(),
      treatmentName: textAC(),
    },
  },
});
