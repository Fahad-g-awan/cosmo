"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import { deleteClinicApi, getManagementClinicsApi } from "@cosmediate/api";
import { GridViewLoader, TableViewLoader, Toaster } from "@cosmediate/ui";
import { Clinic } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import {
  normalizeClinicListFilters,
  useBrandListFetcher,
  useClinicCategoryListFetcher,
  useParentClinicBrowseFetcher,
  useSpecialistBrowseFetcher,
  useTreatmentCategoryListFetcher,
  useTreatmentListFetcher,
} from "@app/lib/filters";
import { handleListDeleteResult } from "@app/lib/api-errors";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildClinicBrowseLayoutConfig } from "../../config/browseLayout.config";
import { ClinicsDataColumns } from "../../config/tables.config";

const ClinicContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog } = useDialog();
  const { session } = useAuth();

  const fetchClinicCategories = useClinicCategoryListFetcher();
  const fetchTreatmentCategories = useTreatmentCategoryListFetcher();
  const fetchParentClinics = useParentClinicBrowseFetcher();
  const fetchSpecialists = useSpecialistBrowseFetcher();
  const fetchTreatments = useTreatmentListFetcher();
  const fetchBrands = useBrandListFetcher();

  const config = useMemo(
    () =>
      buildClinicBrowseLayoutConfig({
        clinicCategories: fetchClinicCategories,
        treatmentCategories: fetchTreatmentCategories,
        brands: fetchBrands,
        treatmentId: fetchTreatments,
        parentClinicId: fetchParentClinics,
        specialistId: fetchSpecialists,
      }),
    [
      fetchBrands,
      fetchClinicCategories,
      fetchParentClinics,
      fetchSpecialists,
      fetchTreatmentCategories,
      fetchTreatments,
    ],
  );
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchClinics = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Clinic>> => {
      if (!session?.tokens?.accessToken) {
        Toaster(
          "Unauthorized Access",
          "error",
          "Please signin again or contact support",
        );
        return { items: [], total: 0 };
      }

      try {
        const res = await getManagementClinicsApi(
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
            filters: normalizeClinicListFilters(params.filters),
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
          items: res.items ?? [],
          total: res.total || 0,
          nextToken: res.nextToken,
        };
      } catch (error) {
        console.error(
          "[ClinicManagement_Clinics_handleFetchClinics] Error fetching clinic records:",
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
    (clinicId: string) => {
      if (!clinicId) {
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
              const resp = await deleteClinicApi(
                { id: clinicId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Clinic deleted successfully",
                errorTitle: "Failed to delete clinic",
                refetch,
                closeDialog,
              });
            } catch (error) {
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Clinic deleted successfully",
                  errorTitle: "Failed to delete clinic",
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
      columns={ClinicsDataColumns(handleDelete, viewMode, perms)}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["name"],
        right: ["actions"],
      }}
      fetchData={handleFetchClinics}
      exportConfig={{ slug: "clinics" }}
    />
  );
};

const Clinics = () => {
  useGatedPanelHeader(panelHeaderConfig.admin.clinicManagement.main, "clinic");

  return (
    <>
      <ClinicContent />
      <DialogRenderer />
    </>
  );
};

export default Clinics;
