"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import type { ActivityLog } from "@cosmediate/type-utils";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { getActivityLogsApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { usePlatformLogsPanelHeader } from "@app/hooks/usePlatformLogsPanelHeader";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { normalizePlatformLogListFilters } from "@app/lib/platform-logs";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildActivityLogsBrowseLayoutConfig } from "../../config/browseLayout.config";
import { ActivityLogsDataColumns } from "../../config/table.config";

const ActivityLogsContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope } = usePagination();
  const { perms } = usePermissions();
  const { session } = useAuth();

  const config = useMemo(() => buildActivityLogsBrowseLayoutConfig(), []);
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchActivityLogs = useCallback(
    async (params: FetchParams): Promise<FetchResponse<ActivityLog>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0, paginationMode: "cursor" };
      }

      try {
        const res = await getActivityLogsApi(
          {
            pagination: {
              limit: params.pagination?.limit || 10,
              nextToken: params.pagination?.nextToken,
            },
            search: params.search?.query
              ? { query: params.search.query }
              : undefined,
            filters: normalizePlatformLogListFilters(params.filters),
            sort: params.sort
              ? { by: params.sort.by, order: params.sort.order }
              : undefined,
          },
          session.tokens.accessToken,
        );

        return {
          items: res.items || [],
          total: res.total ?? undefined,
          nextToken: res.nextToken ?? undefined,
          paginationMode: res.paginationMode ?? "cursor",
        };
      } catch (error) {
        console.error("Error fetching activity logs:", error);
        Toaster(
          "Something went wrong",
          "error",
          "Please try again or contact support",
        );
        return { items: [], total: 0, paginationMode: "cursor" };
      }
    },
    [session],
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
      columns={ActivityLogsDataColumns(viewMode, perms)}
      enableColumnPinning
      initialPinnedColumns={{
        left: ["feedLine"],
        right: ["actions"],
      }}
      fetchData={handleFetchActivityLogs}
      showViewModeToggle
      exportConfig={{ slug: "activity-logs" }}
    />
  );
};

const ActivityMonitoring = () => {
  usePlatformLogsPanelHeader(panelHeaderConfig.admin.activityMonitoring.main);

  return (
    <>
      <ActivityLogsContent />
      <DialogRenderer />
    </>
  );
};

export default ActivityMonitoring;
