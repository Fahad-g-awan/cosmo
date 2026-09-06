"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { deleteBrandApi, getManagementBrandsApi } from "@cosmediate/api";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { TreatmentBrand } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { normalizeContentListFilters } from "@app/lib/filters";
import { handleListDeleteResult } from "@app/lib/api-errors";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildTreatmentBrandsBrowseLayoutConfig } from "../../config/browseLayout.config";
import { TreatmentBrandsColumnsData } from "../../config/tables.config";

const TreatmentBrandsContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();

  const config = useMemo(() => buildTreatmentBrandsBrowseLayoutConfig(), []);
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchTreatmentBrands = useCallback(
    async (params: FetchParams): Promise<FetchResponse<TreatmentBrand>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0 };
      }

      try {
        const res = await getManagementBrandsApi(
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
              entity: "treatment_brand",
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
        console.error(
          "[Treatments_Brands_handleFetchTreatmentBrands] Error fetching brands:",
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
    (brandId: string) => {
      if (!brandId) {
        console.log(
          "[Treatments_Brands_handleDelete] Error brand id not provided",
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
              const resp = await deleteBrandApi(
                { id: brandId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Treatment brand deleted successfully",
                errorTitle: "Failed to delete treatment brand",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.log(
                "[Treatments_Brands_handleDelete] Error deleting treatment brand:",
                error,
              );
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Treatment brand deleted successfully",
                  errorTitle: "Failed to delete treatment brand",
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
      columns={TreatmentBrandsColumnsData(handleDelete, viewMode, perms)}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["brand-name"],
        right: ["actions"],
      }}
      fetchData={handleFetchTreatmentBrands}
      exportConfig={{ slug: "treatment-brands" }}
    />
  );
};

const TreatmentBrands = () => {
  useGatedPanelHeader(
    panelHeaderConfig.admin.treatments.brands.main,
    "treatment_brand",
  );

  return (
    <>
      <TreatmentBrandsContent />
      <DialogRenderer />
    </>
  );
};

export default TreatmentBrands;
