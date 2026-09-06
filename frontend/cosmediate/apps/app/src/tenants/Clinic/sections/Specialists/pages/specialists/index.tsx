"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import {
  deleteSpecialistApi,
  getManagementSpecialistsApi,
} from "@cosmediate/api";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { GridViewLoader, InfoMessage, TableViewLoader, Toaster } from "@cosmediate/ui";
import { Specialist } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import {
  normalizeSpecialistListFilters,
  useBrandListFetcher,
  useClinicOrgBrowseFetcher,
  useTreatmentCategoryListFetcher,
  useTreatmentListFetcher,
} from "@app/lib/filters";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { useWorkspaceListScope } from "@app/hooks/useWorkspaceListScope";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { handleListDeleteResult } from "@app/lib/api-errors";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildSpecialistsBrowseLayoutConfig } from "../../config/browseLayout.config";
import { SpecialistsDataColumns } from "../../config/tables.config";

const SpecialistContent = () => {
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
  } = useWorkspaceListScope({ tab: "specialists" });
  const { sessionUser } = useAuth();
  const orgClinicIds = sessionUser?.scope?.clinicIds ?? [];
  const fetchClinics = useClinicOrgBrowseFetcher(orgClinicIds);

  const fetchTreatmentCategories = useTreatmentCategoryListFetcher();
  const fetchBrands = useBrandListFetcher();
  const fetchTreatments = useTreatmentListFetcher();

  const config = useMemo(
    () =>
      buildSpecialistsBrowseLayoutConfig({
        clinicId: fetchClinics,
        treatmentCategories: fetchTreatmentCategories,
        brands: fetchBrands,
        treatmentId: fetchTreatments,
      }),
    [fetchBrands, fetchClinics, fetchTreatmentCategories, fetchTreatments],
  );
  const lastConfigKey = useRef<string | null>(null);
  const lastScopeRefetchKeyRef = useRef<string | null>(null);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  const handleFetchSpecialists = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Specialist>> => {
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
        const res = await getManagementSpecialistsApi(
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
              ...normalizeSpecialistListFilters(params.filters),
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
          items: res.items || [],
          total: res.total || 0,
          nextToken: res.nextToken,
        };
      } catch (error) {
        console.error(
          "[Clinic_Specialists_handleFetchSpecialists] Error fetching specialists:",
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
    (specialistId: string) => {
      if (!specialistId) {
        console.log(
          "[Clinic_Specialists_HandleDelete] Error specialist id not provided",
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
              const resp = await deleteSpecialistApi(
                { id: specialistId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Specialist deleted successfully",
                errorTitle: "Failed to delete specialist",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.log(
                "[Clinic_Specialists_HandleDelete] Error deleting specialist:",
                error,
              );
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Specialist deleted successfully",
                  errorTitle: "Failed to delete specialist",
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
      columns={SpecialistsDataColumns(handleDelete, viewMode, perms, {
        readOnlyFreelance: true,
      })}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["name"],
        right: ["actions"],
      }}
      fetchData={handleFetchSpecialists}
      exportConfig={{ slug: "specialists" }}
    />
  );
};

const Specialists = () => {
  useGatedPanelHeader(panelHeaderConfig.clinic.specialists.main, "specialist");

  return (
    <>
      <SpecialistContent />
      <DialogRenderer />
    </>
  );
};

export default Specialists;
