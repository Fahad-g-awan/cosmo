"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import { deleteClinicManagerApi, getClinicManagersApi } from "@cosmediate/api";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { ClinicManager } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { normalizeManagerListFilters, useClinicBrowseFetcher } from "@app/lib/filters";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { handleListDeleteResult } from "@app/lib/api-errors";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildManagerBrowseLayoutConfig } from "../../config/browseLayout.config";
import { ManagerDataColumns } from "../../config/tables.config";

const ManagerContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();

  const fetchClinics = useClinicBrowseFetcher();

  const browseConfigScope = "admin-clinicManagement-managers";
  const config = useMemo(
    () =>
      buildManagerBrowseLayoutConfig(browseConfigScope, {
        clinicId: fetchClinics,
      }),
    [fetchClinics],
  );
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchManagers = useCallback(
    async (params: FetchParams): Promise<FetchResponse<ClinicManager>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0 };
      }

      try {
        const res = await getClinicManagersApi(
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
            filters: normalizeManagerListFilters(params.filters),
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
          "[ClinicManagement_Managers_handleFetchManagers] Error fetching manager records:",
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
    (managerId: string) => {
      if (!managerId) {
        console.log(
          "[ClinicManagement_Managers_HandleDelete] Error manager record id not provided",
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
              const resp = await deleteClinicManagerApi(
                { id: managerId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Manager deleted successfully",
                errorTitle: "Failed to delete manager",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.log(
                "[ClinicManagement_Managers_HandleDelete] Error deleting manager record:",
                error,
              );
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Manager deleted successfully",
                  errorTitle: "Failed to delete manager",
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
      columns={ManagerDataColumns(handleDelete, viewMode, perms)}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["name"],
        right: ["actions"],
      }}
      fetchData={handleFetchManagers}
      exportConfig={{ slug: "clinic-managers" }}
    />
  );
};

const Managers = () => {
  useGatedPanelHeader(
    panelHeaderConfig.admin.clinicManagement.managers.main,
    "clinic_manager",
  );

  return (
    <>
      <ManagerContent />
      <DialogRenderer />
    </>
  );
};

export default Managers;
