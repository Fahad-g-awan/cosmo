"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { deleteAdminApi, getAdminsApi } from "@cosmediate/api";
import { Admin } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { handleListDeleteResult } from "@app/lib/api-errors";
import { normalizeUserListFilters } from "@app/lib/filters";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildAdminsBrowseLayoutConfig } from "../../config/browseLayout.config";
import { AdminsDataColumns } from "../../config/table.config";

const AdminsContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog } = useDialog();
  const { session, sessionUser } = useAuth();

  const config = useMemo(() => buildAdminsBrowseLayoutConfig(), []);
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
              ? {
                  query: params.search.query,
                }
              : undefined,
            filters: normalizeUserListFilters(params.filters),
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
          items: res?.items || [],
          total: res.total || 0,
          nextToken: res.nextToken,
        };
      } catch (error) {
        console.error("[ControlPanel_Admins] Error fetching admins:", error);
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
    [session, sessionUser],
  );

  const handleDelete = useCallback(
    (adminId: string) => {
      if (!adminId) {
        console.log(
          "[ControlPanel_Admins_HandleDelete] Error admin id not provided",
        );
        Toaster(
          "Something went wrong",
          "error",
          "Please try again or contact support",
        );
        return;
      }

      if (sessionUser?.profileId && adminId === sessionUser.profileId) {
        Toaster(
          "Cannot delete your own account",
          "error",
          "Ask another admin to remove this account if needed.",
        );
        return;
      }

      openDialog({
        dialogType: "delete",
        payload: {
          onConfirm: async () => {
            try {
              const resp = await deleteAdminApi(
                { id: adminId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Admin deleted successfully",
                errorTitle: "Failed to delete admin",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.log(
                "[ControlPanel_Admins_HandleDelete] Error deleting admin record:",
                error,
              );
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Admin deleted successfully",
                  errorTitle: "Failed to delete admin",
                  refetch,
                  closeDialog,
                },
              );
            }
          },
        },
      });
    },
    [
      refetch,
      closeDialog,
      openDialog,
      session?.tokens?.accessToken,
      sessionUser?.profileId,
    ],
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
      columns={AdminsDataColumns(
        handleDelete,
        viewMode,
        perms,
        sessionUser?.profileId,
      )}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["name"],
        right: ["actions"],
      }}
      fetchData={handleFetchAdmins}
      exportConfig={{ slug: "admins" }}
    />
  );
};

const Admins = () => {
  useGatedPanelHeader(
    panelHeaderConfig.admin.controlPanel.admins.main,
    "admin",
  );

  return (
    <>
      <AdminsContent />
      <DialogRenderer />
    </>
  );
};

export default Admins;
