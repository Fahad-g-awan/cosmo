"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import {
  deleteClinicCategoryApi,
  getManagementClinicCategoriesApi,
} from "@cosmediate/api";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { ClinicCategory } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { normalizeClinicCategoryListFilters } from "@app/lib/filters";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { handleListDeleteResult } from "@app/lib/api-errors";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildClinicCategoriesBrowseLayoutConfig } from "../../config/browseLayout.config";
import { ClinicCategoryColumnsData } from "../../config/tables.config";

const ClinicCategoriesContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();

  const config = useMemo(() => buildClinicCategoriesBrowseLayoutConfig(), []);
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchClinicCategories = useCallback(
    async (params: FetchParams): Promise<FetchResponse<ClinicCategory>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0 };
      }

      try {
        const res = await getManagementClinicCategoriesApi(
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
            filters: normalizeClinicCategoryListFilters(params.filters),
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
        console.error(
          "[Clinic_Categories_handleFetchClinicCategories] Error fetching categories:",
          error,
        );
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
    (categoryId: string) => {
      if (!categoryId) {
        console.log(
          "[Clinic_Categories_handleDelete] Error category id not provided",
        );
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
              const resp = await deleteClinicCategoryApi(
                { id: categoryId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Clinic category deleted successfully",
                errorTitle: "Failed to delete clinic category",
                notFoundTitle: "Clinic category no longer exists",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.log(
                "[Clinic_Categories_handleDelete] Error deleting clinic category:",
                error,
              );
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Clinic category deleted successfully",
                  errorTitle: "Failed to delete clinic category",
                  notFoundTitle: "Clinic category no longer exists",
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
      columns={ClinicCategoryColumnsData(handleDelete, viewMode, perms)}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["category-name"],
        right: ["actions"],
      }}
      fetchData={handleFetchClinicCategories}
      exportConfig={{ slug: "clinic-categories" }}
    />
  );
};

const ClinicCategories = () => {
  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.categories.main,
    "clinic_category",
  );

  return (
    <>
      <ClinicCategoriesContent />
      <DialogRenderer />
    </>
  );
};

export default ClinicCategories;
