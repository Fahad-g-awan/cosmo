"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { TableViewLoader, Toaster } from "@cosmediate/ui";
import {
  deleteAnnouncementApi,
  getManagementAnnouncementsApi,
} from "@cosmediate/api";
import { Announcement } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { normalizeContentListFilters } from "@app/lib/filters";
import { handleListDeleteResult } from "@app/lib/api-errors";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildAnnouncementsBrowseLayoutConfig } from "../config/browseLayout.config";
import { AnnouncementColumnsData } from "../config/tables.config";

const AnnouncementsContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();
  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();

  const config = useMemo(() => buildAnnouncementsBrowseLayoutConfig(), []);
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchAnnouncements = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Announcement>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please sign in again or contact support",
        );
        return { items: [], total: 0 };
      }

      try {
        const res = await getManagementAnnouncementsApi(
          {
            pagination: {
              limit: params.pagination?.limit || 10,
              nextToken: params.pagination?.nextToken,
            },
            search: params.search?.query
              ? { query: params.search.query }
              : undefined,
            filters: normalizeContentListFilters(params.filters, {
              entity: "announcement",
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
        console.error("Error fetching announcements:", error);
        Toaster(
          "Something went wrong",
          "error",
          "Please try again or contact support",
        );
        return { items: [], total: 0 };
      }
    },
    [session],
  );

  const handleDelete = useCallback(
    (announcementId: string) => {
      if (!announcementId) return;

      openDialog({
        dialogType: "delete",
        payload: {
          onConfirm: async () => {
            try {
              const resp = await deleteAnnouncementApi(
                { id: announcementId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Announcement deleted successfully",
                errorTitle: "Failed to delete announcement",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.error("Error deleting announcement:", error);
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Announcement deleted successfully",
                  errorTitle: "Failed to delete announcement",
                  refetch,
                  closeDialog,
                },
              );
            }
          },
        },
      });
    },
    [closeDialog, openDialog, refetch, session?.tokens?.accessToken],
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
      <div className="my-5 w-full">
        <TableViewLoader />
      </div>
    );
  }

  return (
    <BrowseContent
      columns={AnnouncementColumnsData(handleDelete, viewMode, perms)}
      enableColumnPinning
      initialPinnedColumns={{
        left: ["title"],
        right: ["actions"],
      }}
      fetchData={handleFetchAnnouncements}
      exportConfig={{ slug: "announcements" }}
    />
  );
};

const Announcements = () => {
  useGatedPanelHeader(
    panelHeaderConfig.admin.settings.platform.announcements.main,
    "announcement",
  );

  return (
    <>
      <AnnouncementsContent />
      <DialogRenderer />
    </>
  );
};

export default Announcements;
