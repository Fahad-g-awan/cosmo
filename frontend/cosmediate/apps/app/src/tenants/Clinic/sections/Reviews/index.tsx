"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  useFilters,
  usePagination,
  usePreferences,
} from "@cosmediate/browse-manager";
import { ClinicReviewsLoader, NoDataFound } from "@cosmediate/ui";
import { useAuth } from "@cosmediate/auth";
import {
  normalizeBrowseReviewFilters,
  resolveDashboardReviewEntity,
  type ReviewReplyStatusFilter,
  type ReviewsListQuery,
} from "@cosmediate/reviews-core";

import { buildReviewsBrowseLayoutConfig } from "./config/browseLayout.config";
import { useSpecialistEntity } from "@app/hooks/useSpecialistEntity";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import { useWorkspace } from "@app/context/WorkspaceContext";
import { useClinicEntity } from "@app/hooks/useClinicEntity";
import { EntityReviewsPanel } from "@app/modules/Reviews";

const Reviews = () => {
  const { setPanelHeaderConfig } = usePanelHeader();
  const { userRole, sessionUser } = useAuth();
  const { activeClinicId, activeSpecialistId } = useWorkspace();
  const { activeFilters, searchQuery } = useFilters();

  const { clinic, isLoading: isClinicLoading } =
    useClinicEntity(activeClinicId);
  const specialistProfileId =
    userRole === "SPECIALIST"
      ? (activeSpecialistId ?? sessionUser?.profileId)
      : null;
  const { specialist, isLoading: isSpecialistLoading } =
    useSpecialistEntity(specialistProfileId);

  const reviewContext = useMemo(
    () =>
      resolveDashboardReviewEntity({
        userRole,
        activeClinicId,
        specialistProfileId,
        clinic,
        specialist,
      }),
    [userRole, activeClinicId, specialistProfileId, clinic, specialist],
  );

  const entity = reviewContext?.entity ?? null;
  const isLoading =
    userRole === "SPECIALIST" ? isSpecialistLoading : isClinicLoading;

  const { setConfig: setPrefsConfig } = usePreferences();
  const { setConfig: setFiltersConfig } = useFilters();
  const { setScope } = usePagination();

  const lastConfigKey = useRef<string | null>(null);
  const config = useMemo(() => buildReviewsBrowseLayoutConfig(), []);

  const flattenedFilters = useMemo(() => {
    const out: Record<string, unknown> = {};
    Object.entries(activeFilters).forEach(([key, entry]) => {
      out[key] = entry.value;
    });
    return out;
  }, [activeFilters]);

  const [replyStatus, setReplyStatus] =
    useState<ReviewReplyStatusFilter>("incoming");

  const browseListQuery = useMemo((): ReviewsListQuery => {
    const normalizedFilters = normalizeBrowseReviewFilters(
      flattenedFilters,
      replyStatus,
    );

    return {
      search: searchQuery ? { query: searchQuery } : undefined,
      filters: normalizedFilters,
      sort: { by: "createdAt", order: "desc" },
      pagination: { limit: 10 },
    };
  }, [flattenedFilters, searchQuery, replyStatus]);

  const panelConfig = useMemo(
    () =>
      userRole === "SPECIALIST"
        ? {
            ...panelHeaderConfig.specialist.reviews,
            showSearch: true,
          }
        : {
            ...panelHeaderConfig.clinic.reviews,
            showSearch: true,
          },
    [userRole],
  );

  useEffect(() => {
    setPanelHeaderConfig(panelConfig);
  }, [setPanelHeaderConfig, panelConfig]);

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

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5">
      {!isLoading && entity && (
        <>
          <div className="w-full flex justify-start">
            <div className="inline-flex rounded-full bg-ghost-white p-1 gap-1">
              {(["incoming", "answered"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setReplyStatus(status)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${
                    replyStatus === status
                      ? "bg-white text-800 shadow-sm"
                      : "text-500 hover:text-700"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <EntityReviewsPanel
            entity={entity}
            browseListQuery={browseListQuery}
          />
        </>
      )}

      {isLoading && !entity && (
        <div className="w-full flex flex-col items-center justify-start gap-5">
          <ClinicReviewsLoader />
        </div>
      )}

      {!isLoading && !entity && (
        <NoDataFound
          message="Reviews data not found"
          description="If you think this is a mistake, please try again or contact support."
        />
      )}
    </div>
  );
};

export default Reviews;
