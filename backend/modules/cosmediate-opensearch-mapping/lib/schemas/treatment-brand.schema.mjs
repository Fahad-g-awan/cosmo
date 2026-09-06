import { textAC, Boolean } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildTreatmentBrandMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      name: textAC(),
      published: Boolean(),
    },
  },
});
