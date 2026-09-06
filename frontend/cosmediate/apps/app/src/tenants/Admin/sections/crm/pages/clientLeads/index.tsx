"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { deleteLeadApi, getLeadsApi } from "@cosmediate/api";
import type { Lead } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { BrowseContent } from "@app/layout/BrowseLayout";
import { usePermissions } from "@app/hooks/usePermissions";

import { buildCRMLeadsBrowseLayoutConfig } from "../../config/browseLayout.config";
import { ClientLeadDataColumns } from "../../config/table.config";

const CrmLeadsContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog, updateDialogPayload } = useDialog();
  const { session } = useAuth();

  const config = useMemo(() => buildCRMLeadsBrowseLayoutConfig(), []);
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchLeads = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Lead>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0 };
      }

      try {
        const res = await getLeadsApi(
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
            filters: params.filters,
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
        console.error("Error fetching leads:", error);
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
    (leadId: string) => {
      if (!leadId) {
        console.log("[CRM_leads_HandleDelete] Error lead id not provided");
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
              updateDialogPayload({
                payload: { isLoading: true },
              });

              const resp = await deleteLeadApi(
                { id: leadId },
                session?.tokens?.accessToken as string,
              );

              if (resp.success) {
                Toaster("Patient deleted successfully", "success");
                await refetch();
                closeDialog();
              } else {
                console.log("[CRM_leads_HandleDelete] Error deleting patient");

                Toaster(
                  "Something went wrong",
                  "error",
                  "Please try again or contact support",
                );
              }
            } catch (error) {
              console.log(
                "[CRM_leads_HandleDelete] Error deleting patient:",
                error,
              );
              Toaster(
                "Something went wrong",
                "error",
                "Please try again or contact support",
              );
            } finally {
              updateDialogPayload({
                payload: { isLoading: false },
              });
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
      updateDialogPayload,
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
      columns={ClientLeadDataColumns(handleDelete, viewMode, perms)}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["email"],
        right: ["actions"],
      }}
      fetchData={handleFetchLeads}
    />
  );
};

const CrmLeads = () => {
  useGatedPanelHeader(panelHeaderConfig.admin.crm.leads.main, "lead");

  return (
    <>
      <CrmLeadsContent />
      <DialogRenderer />
    </>
  );
};

export default CrmLeads;
