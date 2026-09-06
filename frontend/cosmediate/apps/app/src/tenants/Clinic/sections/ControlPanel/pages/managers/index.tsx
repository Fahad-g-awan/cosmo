"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import {
  GridViewLoader,
  InfoMessage,
  TableViewLoader,
  Toaster,
} from "@cosmediate/ui";
import { deleteClinicManagerApi, getClinicManagersApi } from "@cosmediate/api";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { ClinicManager } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { useWorkspaceListScope } from "@app/hooks/useWorkspaceListScope";
import { useClinicOrgBrowseFetcher } from "@app/lib/filters";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";
import { handleListDeleteResult } from "@app/lib/api-errors";

import { buildManagersBrowseLayoutConfig, normalizeManagerListFilters } from "../../config/browseLayout.config";
import { ManagersDataColumns } from "../../config/table.config";

const ManagersContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const {
    listFilters,
    browseScopeKey,
    isScopeReady,
    scopeBlockedReason,
    refetchOnClinicSwitch,
  } = useWorkspaceListScope({ tab: "managers" });

  const { sessionUser } = useAuth();
  const orgClinicIds = sessionUser?.scope?.clinicIds ?? [];
  const fetchClinics = useClinicOrgBrowseFetcher(orgClinicIds);

  const config = useMemo(
    () => buildManagersBrowseLayoutConfig({ clinicId: fetchClinics }),
    [fetchClinics],
  );
  const lastConfigKey = useRef<string | null>(null);
  const lastScopeRefetchKeyRef = useRef<string | null>(null);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  const handleFetchManagers = useCallback(
    async (params: FetchParams): Promise<FetchResponse<ClinicManager>> => {
      if (!accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0 };
      }

      if (!isScopeReady) {
        return { items: [], total: 0 };
      }

      try {
        const normalizedFilters = normalizeManagerListFilters(params.filters);

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
            filters: {
              ...listFilters,
              ...normalizedFilters,
            },
            sort: params.sort
              ? {
                  by: params.sort.by,
                  order: params.sort.order,
                }
              : undefined,
          },
          accessToken,
        );
        return {
          items: res?.items || [],
          total: res.total || 0,
          nextToken: res.nextToken,
        };
      } catch (error) {
        console.error(
          "[clinic_controlPanel_Managers] Error fetching managers:",
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
    [accessToken, listFilters, isScopeReady],
  );

  const handleDelete = useCallback(
    (managerId: string) => {
      if (!managerId) {
        console.log(
          "[clinic_controlPanel_Managers_HandleDelete] Error manager id not provided",
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
                accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Manager deleted successfully",
                errorTitle: "Failed to delete manager",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.log(
                "[clinic_controlPanel_Managers_HandleDelete] Error deleting manager record:",
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
    [refetch, closeDialog, openDialog, accessToken],
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
    setScope(browseScopeKey);
  }, [config, setFiltersConfig, setPrefsConfig, setScope, browseScopeKey]);

  useEffect(() => {
    if (!refetchOnClinicSwitch || !isScopeReady) return;
    if (lastScopeRefetchKeyRef.current === browseScopeKey) return;

    lastScopeRefetchKeyRef.current = browseScopeKey;
    void refetchRef.current();
  }, [refetchOnClinicSwitch, isScopeReady, browseScopeKey]);

  if (!isScopeReady && scopeBlockedReason) {
    return (
      <div className="w-full my-5">
        <InfoMessage
          title="Clinic scope required"
          message={scopeBlockedReason}
          variant="info"
          size="sm"
        />
      </div>
    );
  }

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
      columns={ManagersDataColumns(handleDelete, viewMode, perms)}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["name"],
        right: ["actions"],
      }}
      fetchData={handleFetchManagers}
    />
  );
};

const Managers = () => {
  useGatedPanelHeader(
    panelHeaderConfig.clinic.controlPanel.managers.main,
    "clinic_manager",
  );

  return (
    <>
      <ManagersContent />
      <DialogRenderer />
    </>
  );
};

export default Managers;
