"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getManagementSubTreatmentsApi,
  getManagementTreatmentResultsApi,
  listManagementClinicSpecialistTreatmentsApi,
} from "@cosmediate/api";
import type { ClinicSpecialistTreatmentItem } from "@cosmediate/api";
import { SubTreatment, TreatmentResult } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import { useWorkspace } from "@app/context/WorkspaceContext";

import type { TreatmentCategoryTab } from "../../types/treatment.types";

/**
 * Read-only CST assignments for specialist services tab.
 */
export function useSpecialistServices() {
  const [assignments, setAssignments] = useState<
    ClinicSpecialistTreatmentItem[]
  >([]);
  const [activeCategory, setActiveCategory] = useState<TreatmentCategoryTab>();
  const [isLoading, setIsLoading] = useState(false);

  const { activeClinicId, activeSpecialistId, scopeVersion } = useWorkspace();
  const { sessionUser, session } = useAuth();
  const specialistId = activeSpecialistId ?? sessionUser?.profileId ?? null;
  const accessToken = session?.tokens?.accessToken;

  const loadAssignments = useCallback(async () => {
    if (!specialistId || !accessToken) return;

    try {
      setIsLoading(true);

      const response = await listManagementClinicSpecialistTreatmentsApi(
        {
          filters: {
            specialistId,
            ...(activeClinicId ? { clinicId: activeClinicId } : {}),
          },
        },
        accessToken,
      );

      setAssignments(response.items ?? []);
    } catch (error) {
      console.error("Error loading specialist services:", error);
      Toaster("Failed to load services", "error");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, activeClinicId, specialistId]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments, scopeVersion]);

  useEffect(() => {
    setActiveCategory(undefined);
  }, [scopeVersion, activeClinicId]);

  const serviceCategories = useMemo(() => {
    const byId = new Map<string, TreatmentCategoryTab>();

    assignments.forEach((assignment) => {
      if (!assignment.categoryId || byId.has(assignment.categoryId)) return;

      byId.set(assignment.categoryId, {
        id: assignment.categoryId,
        name: assignment.categoryName || "Other",
      });
    });

    return Array.from(byId.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [assignments]);

  useEffect(() => {
    if (!activeCategory && serviceCategories.length > 0) {
      setActiveCategory(serviceCategories[0]);
    }
  }, [activeCategory, serviceCategories]);

  const displayedAssignments = useMemo(() => {
    if (!activeCategory) return [];

    return assignments.filter(
      (assignment) => assignment.categoryId === activeCategory.id,
    );
  }, [activeCategory, assignments]);

  return {
    assignments,
    serviceCategories,
    activeCategory,
    setActiveCategory,
    displayedAssignments,
    isLoading,
    specialistId,
    activeClinicId,
    reload: loadAssignments,
  };
}

export function useSpecialistServiceDetail(clinicTreatmentId: string) {
  const [assignment, setAssignment] =
    useState<ClinicSpecialistTreatmentItem | null>(null);
  const [subTreatments, setSubTreatments] = useState<SubTreatment[]>([]);
  const [results, setResults] = useState<TreatmentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { activeSpecialistId, activeClinicId, scopeVersion } = useWorkspace();
  const { sessionUser, session } = useAuth();
  const specialistId = activeSpecialistId ?? sessionUser?.profileId ?? null;
  const accessToken = session?.tokens?.accessToken;

  const loadDetail = useCallback(async () => {
    if (!clinicTreatmentId || !accessToken || !specialistId) return;

    try {
      setIsLoading(true);

      const subTreatmentFilters: Record<string, string> = {
        clinicTreatmentId,
      };
      if (activeClinicId) {
        subTreatmentFilters.clinicId = activeClinicId;
      }

      const [assignmentRes, subRes, resultsRes] = await Promise.all([
        listManagementClinicSpecialistTreatmentsApi(
          {
            filters: {
              clinicTreatmentId,
              specialistId,
              ...(activeClinicId ? { clinicId: activeClinicId } : {}),
            },
            pagination: { limit: 1 },
          },
          accessToken,
        ),
        getManagementSubTreatmentsApi(
          {
            filters: subTreatmentFilters,
            pagination: { limit: 100 },
          },
          accessToken,
        ),
        getManagementTreatmentResultsApi(
          {
            filters: { clinicTreatmentId, ownerType: "CLINIC" },
            pagination: { limit: 100 },
          },
          accessToken,
        ),
      ]);

      setAssignment(assignmentRes.items?.[0] ?? null);
      setSubTreatments(subRes.items ?? []);
      setResults(resultsRes.items ?? []);
    } catch (error) {
      console.error("Error loading service detail:", error);
      Toaster("Failed to load service details", "error");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, activeClinicId, clinicTreatmentId, specialistId]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail, scopeVersion]);

  return { assignment, subTreatments, results, isLoading, reload: loadDetail };
}
