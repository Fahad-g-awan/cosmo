import {
  kw,
  kwNorm,
  text,
  textAC,
  blobOff,
  Boolean,
  Integer,
  Float,
} from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildTreatmentMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      image: kw(),
      name: textAC(),
      recoveryTime: kw(),
      anesthesia: kw(),
      overview: text(),
      faqs: {
        type: "nested",
        properties: {
          question: text(),
          answer: blobOff(),
        },
      },
      tags: kwNorm(),
      categoryId: kw(),
      categoryName: text({ fields: { keyword: { type: "keyword" } } }),
      published: Boolean(),
      authorId: kw(),
      authorName: textAC(),
      authorEmail: kwNorm(),
      searchClicks: Integer(),
      clinicCount: Integer(),
      specialistCount: Integer(),
      avgPrice: Float(),
      minPrice: Float(),
      maxPrice: Float(),
      brandIds: kw(),
    },
  },
});
