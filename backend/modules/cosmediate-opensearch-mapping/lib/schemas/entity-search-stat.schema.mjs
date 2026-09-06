import { kw, Integer } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildEntitySearchStatMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      targetEntityType: kw(),
      targetEntityId: kw(),
      searchClicks: Integer(),
    },
  },
});
