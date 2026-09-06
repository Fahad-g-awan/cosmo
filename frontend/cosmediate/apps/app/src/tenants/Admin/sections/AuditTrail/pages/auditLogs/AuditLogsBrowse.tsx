"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import type { AuditLog } from "@cosmediate/type-utils";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { getAuditLogsApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePermissions } from "@app/hooks/usePermissions";
import { usePlatformLogsPanelHeader } from "@app/hooks/usePlatformLogsPanelHeader";
import { BrowseContent } from "@app/layout/BrowseLayout";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import type { PanelHeaderConfig } from "@app/types/shared";
import {
  buildActorScopedLogsTitle,
  normalizePlatformLogListFilters,
  resolveActorLabelFromLogs,
} from "@app/lib/platform-logs";

import { buildAuditLogsBrowseLayoutConfig } from "../../config/browseLayout.config";
import { AuditLogsDataColumns } from "../../config/table.config";

export interface AuditLogsBrowseProps {
  basePath?: string;
  scope?: string;
  panelHeader?: PanelHeaderConfig;
  lockedActorId?: string;
}

const AuditLogsContent = ({
  basePath = "/audit-trail",
  scope = "admin-audit-trail",
  lockedActorId,
  onActorLabelResolved,
}: Pick<AuditLogsBrowseProps, "basePath" | "scope" | "lockedActorId"> & {
  onActorLabelResolved?: (label: string) => void;
}) => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope } = usePagination();
  const { perms } = usePermissions();
  const { session } = useAuth();

  const config = useMemo(
    () =>
      buildAuditLogsBrowseLayoutConfig({
        scope,
        hideActorFilter: Boolean(lockedActorId),
      }),
    [scope, lockedActorId],
  );
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchAuditLogs = useCallback(
    async (params: FetchParams): Promise<FetchResponse<AuditLog>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0, paginationMode: "cursor" };
      }

      try {
        const res = await getAuditLogsApi(
          {
            pagination: {
              limit: params.pagination?.limit || 10,
              nextToken: params.pagination?.nextToken,
            },
            search: params.search?.query
              ? { query: params.search.query }
              : undefined,
            filters: normalizePlatformLogListFilters({
              ...params.filters,
              ...(lockedActorId ? { actorId: lockedActorId } : {}),
            }),
            sort: params.sort
              ? { by: params.sort.by, order: params.sort.order }
              : undefined,
          },
          session.tokens.accessToken,
        );

        const items = res.items || [];

        if (
          onActorLabelResolved &&
          !params.pagination?.nextToken &&
          items.length
        ) {
          const label = resolveActorLabelFromLogs(items, lockedActorId);
          if (label) onActorLabelResolved(label);
        }

        return {
          items,
          total: res.total ?? undefined,
          nextToken: res.nextToken ?? undefined,
          paginationMode: res.paginationMode ?? "cursor",
        };
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        Toaster(
          "Something went wrong",
          "error",
          "Please try again or contact support",
        );
        return { items: [], total: 0, paginationMode: "cursor" };
      }
    },
    [session, lockedActorId, onActorLabelResolved],
  );

  useEffect(() => {
    const key = JSON.stringify({
      filters: config.filters,
      prefs: config.preferences,
      lockedActorId,
    });

    if (lastConfigKey.current === key) return;
    lastConfigKey.current = key;

    setFiltersConfig(config.filters);
    setPrefsConfig(config.preferences);
    setScope(config.filters.scope);
  }, [config, lockedActorId, setFiltersConfig, setPrefsConfig, setScope]);

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
      columns={AuditLogsDataColumns(viewMode, perms, basePath)}
      enableColumnPinning
      initialPinnedColumns={{
        left: ["actor"],
        right: ["actions"],
      }}
      fetchData={handleFetchAuditLogs}
      showViewModeToggle
      exportConfig={{
        slug: lockedActorId ? "admin-audit-logs" : "audit-trail",
      }}
    />
  );
};

const AuditLogsBrowse = ({
  basePath = "/audit-trail",
  scope = "admin-audit-trail",
  panelHeader = panelHeaderConfig.admin.auditTrail.main,
  lockedActorId,
}: AuditLogsBrowseProps) => {
  const [actorLabel, setActorLabel] = useState<string | null>(null);

  useEffect(() => {
    setActorLabel(null);
  }, [lockedActorId]);

  const resolvedPanelHeader = useMemo(() => {
    if (!panelHeader) return undefined;
    if (!lockedActorId) return panelHeader;

    return {
      ...panelHeader,
      pageTitle: buildActorScopedLogsTitle(
        actorLabel,
        panelHeader.pageTitle,
      ),
    };
  }, [panelHeader, lockedActorId, actorLabel]);

  usePlatformLogsPanelHeader(resolvedPanelHeader);

  return (
    <>
      <AuditLogsContent
        basePath={basePath}
        scope={scope}
        lockedActorId={lockedActorId}
        onActorLabelResolved={lockedActorId ? setActorLabel : undefined}
      />
      <DialogRenderer />
    </>
  );
};

export default AuditLogsBrowse;
