"use client";

import { useMemo } from "react";

import { DashboardPageLoader } from "@cosmediate/ui/";
import type { Clinic, Specialist } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";
import {
  resolveClinicCount,
  resolveDashboardReviewEntity,
} from "@cosmediate/reviews-core";

import { useSpecialistEntity } from "@app/hooks/useSpecialistEntity";
import { useWorkspace } from "@app/context/WorkspaceContext";
import { useClinicEntity } from "@app/hooks/useClinicEntity";

import { useAnalyticsData } from "./hooks/useAnalyticsData";
import { AnalyticsCard } from "./components/AnalyticsCard";
import { RequestsData } from "./components/RequestsData";
import { ReviewsData } from "./components/ReviewsData";
import { Header } from "./components/Header";

const Analytics = () => {
  const { activeClinicId, activeSpecialistId } = useWorkspace();
  const { userRole, sessionUser } = useAuth();

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

  const activeEntity = reviewContext?.entity ?? null;
  const isWorkspaceLoading =
    userRole === "SPECIALIST" ? isSpecialistLoading : isClinicLoading;

  const {
    analyticsData,
    analyticsChartData,
    isLoading: isAnalyticsLoading,
  } = useAnalyticsData({
    treatmentsCount: activeEntity?.treatmentCount || 0,
    clinicCount: resolveClinicCount(userRole, activeEntity),
    activeEntity,
    refetchKey: reviewContext?.refetchKey,
  });

  if (
    isWorkspaceLoading ||
    isAnalyticsLoading ||
    !activeEntity ||
    !sessionUser
  ) {
    return <DashboardPageLoader />;
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-10">
      <Header
        userName={sessionUser.fullName || ""}
        clinic={{
          logo: (activeEntity as Clinic)?.logo,
          name: activeEntity?.name || "",
        }}
      />

      <div className="w-full flex flex-col gap-2">
        <div className="w-full grid grid-cols-4 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-2">
          {analyticsData
            .filter((data) => {
              if (userRole === "SPECIALIST" && data.title === "specialists") {
                return false;
              }
              if (
                userRole === "SPECIALIST" &&
                (activeEntity as Specialist)?.workingType === "FULL_TIME" &&
                data.title === "my clinics"
              ) {
                return false;
              }
              return true;
            })
            .map((data, index) => (
              <AnalyticsCard
                key={index}
                title={data.title}
                data={{
                  totalCount: data.totalCount,
                  todayCount: data?.todayCount,
                  isUpcomingFeature: data?.isUpcomingFeature,
                  colSpan: data?.colSpan,
                }}
              />
            ))}
        </div>

        <div className="w-full grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-1">
          {analyticsChartData.map((data, index) => (
            <AnalyticsCard
              key={index}
              title={data.title}
              data={{
                totalCount: data.totalCount,
                todayCount: data?.todayCount,
                chartData: data?.chartData,
                highlightIndex: data?.highlightIndex,
                chartRange: data?.chartRange,
                onChartRangeChange: data?.onChartRangeChange,
                isUpcomingFeature: data?.isUpcomingFeature,
              }}
            />
          ))}
        </div>
      </div>

      <ReviewsData entity={activeEntity} />

      {/* Upcoming feature */}
      <RequestsData />
    </div>
  );
};

export default Analytics;
