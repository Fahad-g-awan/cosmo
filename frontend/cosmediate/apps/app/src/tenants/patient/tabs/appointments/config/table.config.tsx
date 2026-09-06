import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Image from "next/image";

import { Appointment } from "@cosmediate/type-utils";
import ActionMenu from "@app/components/ActionMenu";

import { FiCalendar as Calendar, FiClock as Clock } from "react-icons/fi";
import { MessageCircle, XCircle } from "lucide-react";

export const AppointmentsColumns = (
  handleCancelAppointment: (id: string) => void,
  handleInboxRoute: () => void
): ColumnDef<Appointment>[] => {
  return [
    {
      accessorFn: (row) => row.treatment?.name,
      id: "treatment",
      header: "Treatment",
      cell: ({ row }) => {
        const treatment = row.original.treatment;
        return (
          <div className="flex items-center gap-2 max-lg:max-w-32 max-lg:gap-0.5">
            <span className="font-medium capitalize line-clamp-2">
              {treatment?.name || "N/A"}
            </span>
          </div>
        );
      },
      size: 180,
    },
    {
      accessorFn: (row) => row.clinic?.name,
      id: "clinic",
      header: "Clinic",
      cell: ({ row }) => {
        const clinic = row.original.clinic;
        return (
          <div className="flex items-center gap-2 max-lg:max-w-32 max-lg:gap-0.5">
            <span className="line-clamp-2">{clinic?.name || "N/A"}</span>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorFn: (row) => row.specialist?.name,
      id: "specialist",
      header: "Specialist",
      cell: ({ row }) => {
        const specialist = row.original.specialist;
        return (
          <div className="flex items-center gap-2 max-lg:max-w-32 max-lg:gap-0.5">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-stroke">
              <Image
                src={specialist?.image || "/avatar.jpg"}
                alt={specialist?.name || ""}
                width={100}
                height={100}
                className="object-cover h-full w-full"
              />
            </div>
            <span className="font-medium capitalize line-clamp-2">
              {specialist?.name || "N/A"}
            </span>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorFn: (row) => row.metadata?.date,
      id: "date",
      header: "Date",
      cell: ({ row }) => {
        const { date, time } = row.original.metadata;
        return (
          <div className="flex items-center gap-2 max-lg:max-w-32 max-lg:gap-0.5">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{date || "N/A"}</span>
            {time && <span className="text-500 text-xs">({time})</span>}
          </div>
        );
      },
      size: 180,
    },
    {
      accessorFn: (row) => row.status,
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const statusColors: Record<string, string> = {
          upcoming: "bg-blue-100 text-blue-800",
          approved: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
          "no show": "bg-yellow-100 text-yellow-800",
          past: "bg-gray-100 text-gray-800",
        };
        return (
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status] || "bg-gray-100 text-gray-800"}`}
            >
              {status || "N/A"}
            </span>
          </div>
        );
      },
      size: 120,
    },
    {
      accessorFn: (row) => row.user?.name,
      id: "patient",
      header: "Patient",
      cell: ({ row }) => {
        const user = row.original.user;
        return (
          <div className="flex items-center gap-2 max-lg:max-w-32 max-lg:gap-0.5">
            <span className="capitalize line-clamp-2">
              {user?.name || "N/A"}
            </span>
          </div>
        );
      },
      size: 160,
    },
    {
      accessorFn: (row) => row.createdAt as string,
      id: "createdAt",
      header: "Created At",
      cell: ({ getValue }) => {
        return (
          <div className="flex items-center gap-2 max-lg:max-w-32 max-lg:gap-0.5">
            <Clock className="h-4 w-4 text-gray-400" />
            {DateTime.fromISO(getValue<string>()).toFormat(
              "dd-MM-yyyy HH:mm"
            ) || "N/A"}
          </div>
        );
      },
      size: 200,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center gap-3">
            <ActionMenu
              items={[
                {
                  label: "Send message to clinic/specialist",
                  icon: <MessageCircle className="size-4" />,
                  onClick: () => handleInboxRoute(),
                },
                {
                  label: "Cancel appointment",
                  icon: <XCircle className="size-4" />,
                  destructive: true,
                  onClick: () => handleCancelAppointment(row.original.id),
                },
              ]}
            />
          </div>
        );
      },
    },
  ];
};
