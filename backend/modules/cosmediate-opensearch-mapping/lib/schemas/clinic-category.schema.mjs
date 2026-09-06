import { textAC, Boolean, Integer } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildClinicCategoryMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      name: textAC(),
      published: Boolean(),
      clinicCount: Integer(),
    },
  },
});
