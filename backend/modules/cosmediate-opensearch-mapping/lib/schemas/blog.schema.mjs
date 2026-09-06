import { kw, kwNorm, textAC, Integer } from "../types.mjs";
import { indexSettings } from "../settings.mjs";

export const buildBlogMapping = (baseProps) => ({
  settings: indexSettings(),
  mappings: {
    dynamic: "strict",
    properties: {
      ...baseProps,
      title: textAC(),
      overview: textAC(),
      image: kw(),
      status: kw(),
      publishedAt: { type: "date" },
      tags: kwNorm(),
      categoryId: kw(),
      categoryName: textAC(),
      authorId: kw(),
      authorName: textAC(),
      authorEmail: kwNorm(),
      searchClicks: Integer(),
    },
  },
});
