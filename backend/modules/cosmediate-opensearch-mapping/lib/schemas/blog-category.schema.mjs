import { textAC, Boolean, Integer } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildBlogCategoryMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      name: textAC(),
      published: Boolean(),
      blogCount: Integer(),
    },
  },
});
