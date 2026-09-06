"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import type { Admin } from "@cosmediate/type-utils";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { getAdminsApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildAdminAuditLogsPickerBrowseLayoutConfig } from "../../config/browseLayout.config";
import { AdminAuditLogsPickerColumns } from "../../config/table.config";

const AuditLogsPickerContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope } = usePagination();
  const { perms } = usePermissions();
  const { session, sessionUser } = useAuth();

  const config = useMemo(
    () => buildAdminAuditLogsPickerBrowseLayoutConfig(),
    [],
  );
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchAdmins = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Admin>> => {
      if (!session?.tokens?.accessToken || !sessionUser) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0 };
      }

      try {
        const res = await getAdminsApi(
          {
            pagination: {
              limit: params.pagination?.limit || 10,
              nextToken: params.pagination?.nextToken,
            },
            search: params.search?.query
              ? { query: params.search.query }
              : undefined,
            filters: params.filters,
            sort: params.sort
              ? { by: params.sort.by, order: params.sort.order }
              : undefined,
          },
          session.tokens.accessToken,
        );

        return {
          items: res?.items || [],
          total: res.total || 0,
          nextToken: res.nextToken,
        };
      } catch (error) {
        console.error("[ControlPanel_AuditLogsPicker] fetch failed:", error);
        Toaster(
          "Something went wrong",
          "error",
          "Please try again or contact support",
        );
        return { items: [], total: 0 };
      }
    },
    [session, sessionUser],
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
      columns={AdminAuditLogsPickerColumns(viewMode, perms)}
      enableColumnPinning
      initialPinnedColumns={{
        left: ["name"],
        right: ["actions"],
      }}
      fetchData={handleFetchAdmins}
    />
  );
};

const AuditLogs = () => {
  useGatedPanelHeader(
    panelHeaderConfig.admin.controlPanel.auditLogs.main,
    "admin",
  );

  return (
    <>
      <AuditLogsPickerContent />
      <DialogRenderer />
    </>
  );
};

export default AuditLogs;
