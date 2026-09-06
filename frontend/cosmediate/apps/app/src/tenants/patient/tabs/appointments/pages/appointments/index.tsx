"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  useFilters,
  usePreferences,
  usePagination,
} from "@cosmediate/browse-manager";
import type { FetchParams, FetchResponse } from "@cosmediate/browse-manager";
import type {
  FiltersConfig,
  PreferencesConfig,
} from "@cosmediate/browse-manager";
import {
  AppointmentTabLoader,
  SecondaryTabs,
  SecondaryTabsList,
  SecondaryTabsTrigger,
  Toaster,
} from "@cosmediate/ui";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import type { Appointment } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { FeatureDetails } from "@app/components/comingSoonFeatures/FeatureDetails";
import ComingSoonBadge from "@app/components/comingSoonFeatures/ComingSoonBadge";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { BrowseContent } from "@app/layout/BrowseLayout";

import { buildAppointmentsConfig } from "../../config/browse-data.config";
import { APPOINTMENTS_MENU_ITEMS } from "../../constants/appointments";
import { AppointmentsColumns } from "../../config/table.config";
import { appointmentsMock } from "../../data/appointments";

export interface BrowseLayoutConfig {
  filters: FiltersConfig;
  preferences: PreferencesConfig;
  customHeader?: ReactNode;
  customControlBar?: ReactNode;
  showItemCount?: boolean;
}

// type AppointmentSortableFields = "metadata.date" | "createdAt" | "status";

// interface SortParams {
//   by: AppointmentSortableFields;
//   order?: "asc" | "desc";
// }

const APPOINTMENTS_COMING_SOON_FEATURES = {
  title: "Appointments Overview",
  description:
    "Easily manage and track all your appointment statuses in one place, from upcoming and approved to cancelled or past bookings. This view helps you stay in control of your schedule and make updates when needed. This is a simplified version shared for your feedback and currently displays sample data to help you explore how appointment management will work.",
  keypoints: [
    "Upcoming Appointments are those you've requested but are still awaiting approval from the clinic.",
    "Approved Appointments have been confirmed by the clinic and are scheduled for a specific date and time.",
    "Cancelled Appointments include those you’ve cancelled or the clinic has declined.",
    "No Show Appointments refer to bookings that have passed without being attended, you can mark them as 'no show' to keep your record accurate.",
    "Past Appointments are completed bookings that you’ve already attended or missed.",
    "You can cancel any active appointment using the action button provided within each appointment card.",
  ],
};

// Simulate async API fetch from mock data
const simulateFetchAppointments = (
  allData: Appointment[],
  params: FetchParams,
): Promise<FetchResponse<Appointment>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...allData];

      // Search
      if (params.search?.query) {
        const q = params.search.query.toLowerCase();
        filtered = filtered.filter(
          (apt) =>
            apt.treatment?.name?.toLowerCase().includes(q) ||
            apt.clinic?.name?.toLowerCase().includes(q) ||
            apt.specialist?.name?.toLowerCase().includes(q) ||
            apt.user?.name?.toLowerCase().includes(q) ||
            apt.status?.toLowerCase().includes(q),
        );
      }

      // Filter by status
      if (
        params.filters?.status &&
        Array.isArray(params.filters.status) &&
        params.filters.status.length > 0
      ) {
        filtered = filtered.filter((apt) =>
          (params.filters!.status as string[]).includes(apt.status),
        );
      }

      // Sort
      // if (params.sort?.by) {
      //   const sortBy = params.sort.by;
      //   const order = params.sort.order === "desc" ? -1 : 1;

      //   filtered.sort((a, b) => {
      //     let valA: string;
      //     let valB: string;

      //     if (sortBy === "metadata.date") {
      //       valA = a.metadata?.date || "";
      //       valB = b.metadata?.date || "";
      //     } else if (sortBy === "createdAt") {
      //       valA = (a.createdAt as string) || "";
      //       valB = (b.createdAt as string) || "";
      //     } else {
      //       valA = ((a as Record<string, unknown>)[sortBy] as string) || "";
      //       valB = ((b as Record<string, unknown>)[sortBy] as string) || "";
      //     }

      //     return valA.localeCompare(valB) * order;
      //   });
      // }

      if (params.sort?.by) {
        const sortBy = params.sort.by;
        const order = params.sort.order === "desc" ? -1 : 1;

        filtered.sort((a, b) => {
          let valA = "";
          let valB = "";

          switch (sortBy) {
            case "metadata.date":
              valA = a.metadata?.date ?? "";
              valB = b.metadata?.date ?? "";
              break;

            case "createdAt":
              valA = a.createdAt ?? "";
              valB = b.createdAt ?? "";
              break;

            case "status":
              valA = a.status ?? "";
              valB = b.status ?? "";
              break;
          }

          return valA.localeCompare(valB) * order;
        });
      }

      // Pagination
      const limit = params.pagination?.limit || 5;
      const page = params.pagination?.page || 1;
      const startIndex = params.pagination?.nextToken
        ? parseInt(params.pagination.nextToken, 10)
        : (page - 1) * limit;

      const paged = filtered.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < filtered.length;

      resolve({
        items: paged,
        total: filtered.length,
        nextToken: hasMore ? String(startIndex + limit) : undefined,
      });
    }, 600);
  });
};

const AppointmentsContent = () => {
  const [mockData, setMockData] = useState<Appointment[]>(appointmentsMock);
  const [activeTab, setActiveTab] = useState("upcoming");

  const { setConfig: setFiltersConfig } = useFilters();
  const { setConfig: setPrefsConfig } = usePreferences();
  const { setScope, refetch, items } = usePagination();

  const { openDialog, closeDialog } = useDialog();
  const { isMobileView } = useWindowWidth();
  const router = useRouter();

  const lastConfigKey = useRef<string | null>(null);
  const previousTabRef = useRef(activeTab);

  const config = useMemo(() => buildAppointmentsConfig(), []);

  const menuOrientation = useMemo(() => {
    if (isMobileView) return "vertical";
    return "horizontal";
  }, [isMobileView]);

  const getCount = useCallback(
    (status: string) => {
      if (!items || !Array.isArray(items) || items.length === 0) return 0;

      return (items as Appointment[]).filter(
        (item: Appointment) => item?.status === status,
      ).length;
    },
    [items],
  );

  const fetchAppointments = useCallback(
    async (params: FetchParams): Promise<FetchResponse<Appointment>> => {
      return simulateFetchAppointments(mockData, {
        ...params,
        filters: { ...params.filters, status: activeTab },
      });
    },
    [mockData, activeTab],
  );

  const handleInboxRoute = useCallback(() => {
    router.push("/inbox");
  }, [router]);

  const handleCancelAppointment = useCallback(
    (appointmentId: string) => {
      openDialog({
        dialogType: "cancel-appointment-request",
        payload: {
          onConfirm: async () => {
            setMockData((prev) =>
              prev.map((apt) =>
                apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt,
              ),
            );
            Toaster("Appointment cancelled successfully");
            await refetch();
            closeDialog();
          },
        },
      });
    },
    [openDialog, closeDialog, refetch],
  );

  const columns = useMemo(
    () => AppointmentsColumns(handleCancelAppointment, handleInboxRoute),
    [handleCancelAppointment, handleInboxRoute],
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

  useEffect(() => {
    if (previousTabRef.current === activeTab) return;
    previousTabRef.current = activeTab;
    refetch();
  }, [activeTab, refetch]);

  if (!config) return <AppointmentTabLoader />;

  return (
    <div className="w-full flex flex-col items-center justify-start gap-5 max-lg:gap-4">
      <div
        className={cn(
          "w-full bg-ghost-blue flex flex-col items-start justify-center gap-4 max-lg:items-center p-10 max-sm:p-2 rounded-2xl mb-5",
        )}
      >
        <ComingSoonBadge />
        <FeatureDetails
          feature={APPOINTMENTS_COMING_SOON_FEATURES}
          className="p-0 bg-transparent w-auto"
        />
      </div>

      <div className="w-full flex items-center justify-start">
        <SecondaryTabs
          value={activeTab}
          onValueChange={setActiveTab}
          orientation={menuOrientation}
        >
          <SecondaryTabsList>
            {APPOINTMENTS_MENU_ITEMS.map((item) => (
              <SecondaryTabsTrigger key={item.value} value={item.value}>
                {item.label} ({getCount(item.value)})
              </SecondaryTabsTrigger>
            ))}
          </SecondaryTabsList>
        </SecondaryTabs>
      </div>

      <BrowseContent
        columns={columns}
        enableColumnPinning={true}
        initialPinnedColumns={{
          left: ["treatment"],
          right: ["actions"],
        }}
        fetchData={fetchAppointments}
      />
    </div>
  );
};

const Appointments = () => {
  const { setPanelHeaderConfig } = usePanelHeader();

  useEffect(() => {
    setPanelHeaderConfig(panelHeaderConfig.patient.appointments.main);
  }, [setPanelHeaderConfig]);

  return (
    <>
      <AppointmentsContent />
      <DialogRenderer />
    </>
  );
};

export default Appointments;
