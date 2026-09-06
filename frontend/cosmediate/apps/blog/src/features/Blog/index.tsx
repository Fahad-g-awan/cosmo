"use client";

import React, { useCallback, useMemo } from "react";

import type {
  FetchParams,
  FetchResponse,
  ViewModes,
} from "@cosmediate/browse-manager";
import {
  mapListApiResponse,
  usePreferencesOptional,
} from "@cosmediate/browse-manager";
import {
  NoDataFound,
  BlogsMainPageLoader,
  ListItemsLoader,
  GridItemsLoader,
} from "@cosmediate/ui";
import { useTranslations } from "@cosmediate/i18n/client";
import { BrowseLayout } from "@blog/layout/BrowseLayout";
import type { Blog } from "@cosmediate/type-utils";
import { getBlogsApi } from "@cosmediate/api";

import {
  FilterOptionsProvider,
  useFilterOptions,
} from "@blog/context/FilterOptionsContext";
import { normalizeBlogBrowseFilters } from "@blog/lib/filters/blog-list-filters";

import TopSearchedBlogs from "./components/TopSearchedBlogs";
import { GridView } from "./components/views/GridView";
import { ListView } from "./components/views/ListView";
import { buildBlogsConfig } from "./lib/config";

const Blogs = () => {
  const browse = useTranslations("browse");
  const { blogCategories, isLoading } = useFilterOptions();
  const viewMode = usePreferencesOptional()?.viewMode;

  const config = useMemo(
    () =>
      buildBlogsConfig({
        blogCategories,
        browse,
      }),
    [blogCategories, browse],
  );

  const fetchBlogs = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Blog>> => {
      try {
        const sortBy = params.sort?.by;
        const isTopSearchedSort =
          sortBy === "searchClicks" || sortBy === "topSearched";

        const response = await getBlogsApi({
          ...params,
          filters: {
            ...normalizeBlogBrowseFilters(params.filters),
            ...(isTopSearchedSort ? { allowZeroSearchClicks: true } : {}),
          },
        });
        return mapListApiResponse(response);
      } catch (error) {
        console.error("Error fetching blogs:", error);
        return {
          items: [],
          total: 0,
        };
      }
    },
    [],
  );

  const renderBlogCard = useCallback((item: Blog, viewMode: ViewModes) => {
    if (viewMode === "list") return <ListView blog={item} />;
    return <GridView blog={item} />;
  }, []);

  if (isLoading || !config) return <BlogsMainPageLoader />;

  return (
    <div className="w-full flex flex-col gap-3 items-start justify-start">
      <BrowseLayout
        config={config}
        fetchData={fetchBlogs}
        renderItem={renderBlogCard}
        loadingComponent={
          viewMode === "list" ? <ListItemsLoader /> : <GridItemsLoader />
        }
        emptyComponent={
          <NoDataFound
            message={browse.empty.blogs}
            description={browse.empty.refreshHint}
            className="my-20"
          />
        }
        noResultsComponent={
          <NoDataFound
            message={browse.empty.blogs}
            description={browse.empty.noResultsHint}
            className="my-20"
          />
        }
        entity="blogs"
      />

      <TopSearchedBlogs />
    </div>
  );
};

const BlogsPage = () => {
  return (
    <FilterOptionsProvider>
      <Blogs />
    </FilterOptionsProvider>
  );
};

export default BlogsPage;
