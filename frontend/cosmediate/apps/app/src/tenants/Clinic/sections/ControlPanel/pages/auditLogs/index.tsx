"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import type { ClinicManager } from "@cosmediate/type-utils";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import { GridViewLoader, InfoMessage, TableViewLoader, Toaster } from "@cosmediate/ui";
import { getClinicManagersApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { useWorkspaceListScope } from "@app/hooks/useWorkspaceListScope";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildManagerAuditLogsPickerBrowseLayoutConfig } from "../../config/browseLayout.config";
import { ManagerAuditLogsPickerColumns } from "../../config/table.config";

const AuditLogsPickerContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const {
    listFilters,
    browseScopeKey,
    isScopeReady,
    scopeBlockedReason,
    refetchOnClinicSwitch,
  } = useWorkspaceListScope({ tab: "managers" });

  const config = useMemo(
    () => buildManagerAuditLogsPickerBrowseLayoutConfig(),
    [],
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
        const res = await getClinicManagersApi(
          {
            pagination: {
              limit: params.pagination?.limit || 10,
              nextToken: params.pagination?.nextToken,
            },
            search: params.search?.query
              ? { query: params.search.query }
              : undefined,
            filters: {
              ...params.filters,
              ...listFilters,
            },
            sort: params.sort
              ? { by: params.sort.by, order: params.sort.order }
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
        console.error("[Clinic_ControlPanel_AuditLogsPicker] fetch failed:", error);
        Toaster(
          "Something went wrong",
          "error",
          "Please try again or contact support",
        );
        return { items: [], total: 0 };
      }
    },
    [accessToken, listFilters, isScopeReady],
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
      columns={ManagerAuditLogsPickerColumns(viewMode, perms)}
      enableColumnPinning
      initialPinnedColumns={{
        left: ["name"],
        right: ["actions"],
      }}
      fetchData={handleFetchManagers}
    />
  );
};

const AuditLogs = () => {
  useGatedPanelHeader(
    panelHeaderConfig.clinic.controlPanel.auditLogs.main,
    "clinic_manager",
  );

  return (
    <>
      <AuditLogsPickerContent />
      <DialogRenderer />
    </>
  );
};

export default AuditLogs;
