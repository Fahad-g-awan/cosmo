"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";

import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import type { Patient } from "@cosmediate/type-utils";

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
import { deletePatientApi, getPatientsApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import { useWorkspace } from "@app/context/WorkspaceContext";
import { useGatedPanelHeader } from "@app/hooks/useGatedPanelHeader";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { handleListDeleteResult } from "@app/lib/api-errors";
import {
  normalizeUserListFilters,
  useClinicOrgBrowseFetcher,
  useSpecialistClinicBrowseFetcher,
} from "@app/lib/filters";
import { useWorkspaceListScope } from "@app/hooks/useWorkspaceListScope";
import { usePermissions } from "@app/hooks/usePermissions";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildPatientsBrowseLayoutConfig } from "../../config/browseLayout.config";
import { PatientsDataColumns } from "../../config/table.config";
import { getPatientsPanelHeader } from "../../lib/patientsPanelHeader";

const PatientsContent = () => {
  const { setConfig: setPrefsConfig, viewMode } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope, refetch } = usePagination();
  const { perms } = usePermissions();

  const { openDialog, closeDialog } = useDialog();
  const { session, userRole } = useAuth();
  const accessToken = session?.tokens?.accessToken;
  const {
    listFilters,
    browseScopeKey,
    isScopeReady,
    scopeBlockedReason,
    refetchOnClinicSwitch,
  } = useWorkspaceListScope({ tab: "patients" });

  const { sessionUser } = useAuth();
  const { activeClinicId } = useWorkspace();
  const orgClinicIds = sessionUser?.scope?.clinicIds ?? [];
  const isSpecialist = userRole === "SPECIALIST";

  const fetchClinics = useClinicOrgBrowseFetcher(orgClinicIds);
  const fetchSpecialists = useSpecialistClinicBrowseFetcher(activeClinicId);

  const config = useMemo(
    () =>
      buildPatientsBrowseLayoutConfig(
        {
          clinicId: fetchClinics,
          specialistId: fetchSpecialists,
        },
        {
          includeClinicFilter: !isSpecialist,
          includeSpecialistFilter: !isSpecialist,
        },
      ),
    [fetchClinics, fetchSpecialists, isSpecialist],
  );
  const lastConfigKey = useRef<string | null>(null);

  const handleFetchPatients = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Patient>> => {
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
        const normalizedFilters = normalizeUserListFilters(params.filters);

        const res = await getPatientsApi(
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
          items: res.items || [],
          total: res.total || 0,
          nextToken: res.nextToken,
        };
      } catch (error) {
        console.error("Error fetching patients:", error);
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
    (patientId: string) => {
      if (!patientId) {
        console.log("[Patients_HandleDelete] Error patient id not provided");
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
              const resp = await deletePatientApi(
                { id: patientId },
                session?.tokens?.accessToken as string,
              );

              await handleListDeleteResult(resp, {
                successMessage: "Patient deleted successfully",
                errorTitle: "Failed to delete patient",
                refetch,
                closeDialog,
              });
            } catch (error) {
              console.log("[Patients] Error deleting patient:", error);
              await handleListDeleteResult(
                {
                  success: false,
                  message: error instanceof Error ? error.message : undefined,
                },
                {
                  successMessage: "Patient deleted successfully",
                  errorTitle: "Failed to delete patient",
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
    void refetch();
  }, [refetchOnClinicSwitch, isScopeReady, browseScopeKey, refetch]);

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
      columns={PatientsDataColumns(handleDelete, viewMode, perms)}
      enableColumnPinning={true}
      initialPinnedColumns={{
        left: ["name"],
        right: ["actions"],
      }}
      fetchData={handleFetchPatients}
      exportConfig={{ slug: "patients" }}
    />
  );
};

const Patients = () => {
  const { userRole } = useAuth();
  useGatedPanelHeader(getPatientsPanelHeader(userRole, "main"), "patient");

  return (
    <>
      <PatientsContent />
      <DialogRenderer />
    </>
  );
};

export default Patients;
