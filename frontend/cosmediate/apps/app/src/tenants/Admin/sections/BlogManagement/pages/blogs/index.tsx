"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { deleteBlogApi, getManagementBlogsApi } from "@cosmediate/api";
import { Blog } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { normalizeContentListFilters } from "@app/lib/filters";
import {
  useAdminBrowseFetcher,
  useBlogCategoryListFetcher,
} from "@app/lib/filters";
import { handleListDeleteResult } from "@app/lib/api-errors";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildBlogsBrowseLayoutConfig } from "../../config/browseLayout.config";
import { BlogColumnsData } from "../../config/tables.config";

const BlogsContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const fetchBlogCategories = useBlogCategoryListFetcher();
  const fetchBlogAuthors = useAdminBrowseFetcher();

  const config = useMemo(
    () => buildBlogsBrowseLayoutConfig(fetchBlogCategories, fetchBlogAuthors),
    [fetchBlogAuthors, fetchBlogCategories],
  );
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchBlogs = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Blog>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0 };
      }

      try {
        const res = await getManagementBlogsApi(
          {
            pagination: {
              limit: params.pagination?.limit || 10,
              nextToken: params.pagination?.nextToken,
            },
            search: params.search?.query
              ? {
                  query: params.search.query,
                }
              : undefined,
            filters: normalizeContentListFilters(params.filters, {
              entity: "blog",
            }),
            sort: params.sort
              ? {
                  by: params.sort.by,
                  order: params.sort.order,
                }
              : undefined,
          },
          session.tokens.accessToken,
        );

        return {
          items: res.items || [],
          total: res.total || 0,
          nextToken: res.nextToken,
        };
      } catch (error) {
        console.error("Error fetching blogs:", error);
        Toaster(
          "Something went wrong",
          "error",
          "Please try again or contact support",
        );
        return {
          items: [],
          total: 0,
        };
      }
    },
    [session],
  );

  const handleDelete = useCallback(
    (blogId: string) => {
      if (!blogId) {
        console.log("[Blogs_HandleDelete] Error blog id not provided");
        Toaster(
          "Something went wrong",
          "error",
          "Please try again or contact support",
        );
        return;
      }

      openDialog({
        dialogType: "delete",
        payload: {
          onConfirm: async () => {
            try {
              const resp = await deleteBlogApi(
                { id: blogId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Blog deleted successfully",
                errorTitle: "Failed to delete blog",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.log("[Blogs_HandleDelete] Error deleting blog:", error);
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Blog deleted successfully",
                  errorTitle: "Failed to delete blog",
                  refetch,
                  closeDialog,
                },
              );
            }
          },
        },
      });
    },
    [refetch, closeDialog, openDialog, session?.tokens?.accessToken],
  );

  useEffect(() => {
    const key = JSON.stringify({
      filters: config.filters,
      prefs: config.preferences,
    });

    if (lastConfigKey.current === key) return;
    lastConfigKey.current = key;

    setFiltersConfig(config.filters);
    setPrefsConfig(config.preferences);
    setScope(config.filters.scope);
  }, [config, setFiltersConfig, setPrefsConfig, setScope]);

  if (!config && viewMode === "table") {
    return (
      <div className="w-full my-5">
        <TableViewLoader />
      </div>
    );
  }

  if (!config && viewMode === "grid") {
    return <GridViewLoader />;
  }

  return (
    <BrowseContent
      columns={BlogColumnsData(handleDelete, viewMode, perms)}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["title"],
        right: ["actions"],
      }}
      fetchData={handleFetchBlogs}
      exportConfig={{ slug: "blogs" }}
    />
  );
};

const Blogs = () => {
  useGatedPanelHeader(panelHeaderConfig.admin.blogManagement.main, "blog");

  return (
    <>
      <BlogsContent />
      <DialogRenderer />
    </>
  );
};

export default Blogs;
