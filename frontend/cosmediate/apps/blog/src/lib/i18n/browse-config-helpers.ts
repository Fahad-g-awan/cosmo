import type { BrowseMessages } from "@cosmediate/i18n";
import type { BrowseLayoutConfig } from "@blog/layout/BrowseLayout";

export function buildBlogBrowseSortOptions(
  browse: BrowseMessages,
): NonNullable<BrowseLayoutConfig["preferences"]>["sortOptions"] {
  const { sort } = browse;

  return [
    {
      label: sort.newest,
      value: "newest",
      sortBy: "newest",
      order: "desc" as const,
    },
    {
      label: sort.oldest,
      value: "oldest",
      sortBy: "oldest",
      order: "asc" as const,
    },
    {
      label: sort.topSearched,
      value: "top_searched",
      sortBy: "searchClicks",
      order: "desc" as const,
    },
    {
      label: sort.nameAsc,
      value: "alph_asc",
      sortBy: "name",
      order: "asc" as const,
    },
    {
      label: sort.nameDesc,
      value: "alph_desc",
      sortBy: "name",
      order: "desc" as const,
    },
  ];
}

export function buildBlogMonthOptions(browse: BrowseMessages) {
  return browse.filters.months.map((label, index) => ({
    label,
    value: String(index + 1),
  }));
}
