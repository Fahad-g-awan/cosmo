import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";

import {
  FetchParams,
  FetchResponse,
  useFilters,
  usePagination,
  usePreferences,
} from "@cosmediate/browse-manager";
import { AppointmentTabLoader, InfoMessage, Toaster } from "@cosmediate/ui";

import { buildAppointmentsRequestConfig } from "./config/browseDataConfig";
import { DialogRenderer } from "@app/context/dialog/DialogRenderer";
import { Appointment } from "@cosmediate/type-utils/appointment";
import { useDialog } from "@app/context/dialog/DialogProvider";
import { AppointmentsColumns } from "./config/tableConfig";
import { BrowseContent } from "@app/layout/BrowseLayout";
import { appointmentsMock } from "./data/appointments";

// Simulate async API fetch from mock data
const simulateFetchAppointments = (
  allData: Appointment[],
  params: FetchParams
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
            apt.status?.toLowerCase().includes(q)
        );
      }

      // Filter by status
      if (
        params.filters?.status &&
        Array.isArray(params.filters.status) &&
        params.filters.status.length > 0
      ) {
        filtered = filtered.filter((apt) =>
          (params.filters!.status as string[]).includes(apt.status)
        );
      }

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

export const RequestsData = () => {
  const [mockData, setMockData] = useState<Appointment[]>(appointmentsMock);

  const { openDialog, closeDialog } = useDialog();

  const {
    setConfig: setFiltersConfig,
    updatePendingFilter,
    pendingFilters,
    applyFilters,
  } = useFilters();
  const { setConfig: setPrefsConfig } = usePreferences();
  const { setScope, refetch, items } = usePagination();

  const lastConfigKey = useRef<string | null>(null);

  const config = useMemo(() => buildAppointmentsRequestConfig(), []);
  const newRequestscount = useMemo(
    () =>
      (items as Appointment[])?.filter(
        (item: Appointment) => item.status === "upcoming"
      ).length,
    [items]
  );

  const fetchAppointments = useCallback(
    async (params?: FetchParams): Promise<FetchResponse<Appointment>> => {
      return simulateFetchAppointments(mockData, {
        // ...params,
        // filters: { ...params.filters },
      });
    },
    [mockData]
  );

  const handleCancelRequest = (aptReqId: string) => {
    openDialog({
      dialogType: "cancel-appointment-request",
      payload: {
        onConfirm: async () => {
          setMockData((prev) =>
            prev.map((apt) =>
              apt.id === aptReqId ? { ...apt, status: "cancelled" } : apt
            )
          );
          Toaster("Appointment cancelled successfully");
          closeDialog();
        },
      },
    });
  };

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

  // useEffect(() => {
  //   updatePendingFilter("status", [activeTab]);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [activeTab]);

  // useEffect(() => {
  //   const handleApplyFilters = async () => applyFilters();
  //   handleApplyFilters();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pendingFilters]);

  if (!config) return <AppointmentTabLoader />;

  console.log("data==>", fetchAppointments());

  return (
    <div className="w-full flex flex-col items-center justify-start gap-7">
      <div className="w-full flex items-center justify-between border-b-[2px] border-stroke pb-3">
        <div className="text-start text-[18px] font-bold leading-[22px] text-700">
          Incoming Requests (+{newRequestscount})
        </div>

        <Link
          href={"/requests"}
          className="font-semibold text-sm text-primary-accent/80 hover:text-primary-accent/100 hover:underline underline-offset-4"
        >
          Show All
        </Link>
      </div>

      <InfoMessage
        title="Upcoming Feature"
        message="This feature is currently under development. Soon, users will be able to request appointments, and clinics and specialists will be able to manage patient requests efficiently."
        size="sm"
      />

      <BrowseContent
        columns={AppointmentsColumns(handleCancelRequest)}
        enableColumnPinning={true}
        initialPinnedColumns={{
          left: ["treatment"],
          right: ["actions"],
        }}
        fetchData={fetchAppointments}
        showControlBar={false}
        showPagination={false}
      />

      <DialogRenderer />
    </div>
  );
};
