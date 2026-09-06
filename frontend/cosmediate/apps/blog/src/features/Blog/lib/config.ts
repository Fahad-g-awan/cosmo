import type { BrowseLayoutConfig } from "@blog/layout/BrowseLayout";
import type { FilterConfig } from "@cosmediate/browse-manager";
import type { BlogCategory } from "@cosmediate/type-utils";
import type { BrowseMessages } from "@cosmediate/i18n";

import {
  buildBlogBrowseSortOptions,
  buildBlogMonthOptions,
} from "@blog/lib/i18n/browse-config-helpers";

interface BuildBlogsConfigParams {
  blogCategories: BlogCategory[];
  browse: BrowseMessages;
}

const buildYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 11 }, (_, index) => {
    const year = currentYear - index;
    return { label: String(year), value: String(year) };
  });
};

export const buildBlogsConfig = ({
  blogCategories,
  browse,
}: BuildBlogsConfigParams): BrowseLayoutConfig => {
  const { labels } = browse.filters;

  const filters: FilterConfig[] = [
    {
      type: "checkbox",
      id: "blogCategories",
      label: labels.blogCategories,
      options: blogCategories.map((cat) => ({
        label: cat.name,
        value: cat.id,
      })),
      defaultValue: [],
    },
    {
      type: "radio",
      id: "publishedMonth",
      label: labels.month,
      options: buildBlogMonthOptions(browse),
      defaultValue: "",
    },
    {
      type: "radio",
      id: "publishedYear",
      label: labels.year,
      options: buildYearOptions(),
      defaultValue: "",
    },
    {
      type: "range-date",
      id: "publishedAt",
      label: labels.publishedDate,
      defaultValue: [null, null],
    },
  ];

  return {
    filters: {
      scope: "blogs",
      pageType: "blogs",
      searchField: {
        id: "query",
        type: "text",
        label: browse.search.label,
        placeholder: browse.search.blogs,
      },
      filters,
      syncToUrl: true,
    },
    preferences: {
      scope: "blogs",
      pageType: "blogs",
      sortOptions: buildBlogBrowseSortOptions(browse),
      viewModes: ["grid", "list"],
      itemsPerPage: 12,
      syncToUrl: true,
    },
  };
};
