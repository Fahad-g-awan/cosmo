import type { BrowseMessages } from "@cosmediate/i18n";
import type { BrowseLayoutConfig } from "@web/layout/BrowseLayout";

export function buildBrowseSortOptions(
  browse: BrowseMessages,
  options?: { includeTopSearched?: boolean },
): NonNullable<BrowseLayoutConfig["preferences"]>["sortOptions"] {
  const { sort } = browse;
  const base = [
    { label: sort.newest, value: "newest", sortBy: "newest", order: "desc" as const },
    { label: sort.oldest, value: "oldest", sortBy: "oldest", order: "asc" as const },
  ];

  if (options?.includeTopSearched) {
    base.push({
      label: sort.topSearched,
      value: "top_searched",
      sortBy: "searchClicks",
      order: "desc" as const,
    });
  }

  return [
    ...base,
    { label: sort.nameAsc, value: "alph_asc", sortBy: "name", order: "asc" as const },
    { label: sort.nameDesc, value: "alph_desc", sortBy: "name", order: "desc" as const },
    {
      label: sort.highestRated,
      value: "rating",
      sortBy: "rating",
      order: "desc" as const,
    },
    {
      label: sort.priceAsc,
      value: "price_asc",
      sortBy: "price",
      order: "asc" as const,
    },
    {
      label: sort.priceDesc,
      value: "price_desc",
      sortBy: "price",
      order: "desc" as const,
    },
  ];
}

export function buildRatingFilterOptions(browse: BrowseMessages) {
  const { rating } = browse.filters;
  return [
    { label: rating.veryGood, value: "9" },
    { label: rating.good, value: "8" },
    { label: rating.proper, value: "7" },
    { label: rating.adequate, value: "6" },
  ];
}
