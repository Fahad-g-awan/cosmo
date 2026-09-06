import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";

import type { ActivityLog } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import TableCellItem from "@app/components/table/TableCellItem";
import { ViewOnlyActionButton } from "@app/components/table/ViewOnlyActionButton";
import {
  formatLogActionLabel,
  formatLogEntityLabel,
} from "@app/lib/platform-logs";

import {
  FiCalendar as Calendar,
  FiShield as Shield,
  FiUser as User,
} from "react-icons/fi";
import { Activity, Radio } from "lucide-react";

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700",
  UPDATE: "bg-amber-50 text-amber-700",
  DELETE: "bg-rose-50 text-rose-700",
  SOFT_DELETE: "bg-orange-50 text-orange-700",
};

export const ActivityLogsDataColumns = (
  viewMode: string,
  perms: string[] = [],
  basePath = "/activity-monitoring",
): ColumnDef<ActivityLog>[] => [
  {
    accessorFn: (row) => row.feedLine,
    id: "feedLine",
    header: "Activity",
    cell: ({ getValue }) => (
      <TableCellItem
        icon={Activity}
        value={getValue<string>() || "N/A"}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
        valueClassName="font-medium"
      />
    ),
    size: 400,
  },
  {
    accessorFn: (row) => row.actorDisplayName,
    id: "actor",
    header: "Actor",
    cell: ({ getValue }) => (
      <TableCellItem
        icon={User}
        value={getValue<string>() || "N/A"}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
        valueClassName="capitalize"
      />
    ),
    size: 180,
  },
  {
    accessorFn: (row) => row.action,
    id: "action",
    header: "Action",
    cell: ({ getValue }) => {
      const action = getValue<string>();
      return (
        <TableCellItem
          icon={Shield}
          value={formatLogActionLabel(action)}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
          valueClassName={cn(
            "px-2 py-1 rounded-full text-[10px] uppercase font-semibold",
            actionColors[action] || "bg-100 text-800",
          )}
        />
      );
    },
    size: 140,
    meta: {
      exportValue: (row) => formatLogActionLabel(row.action),
    },
  },
  {
    accessorFn: (row) => row.scope,
    id: "scope",
    header: "Scope",
    cell: ({ getValue }) => (
      <TableCellItem
        icon={Radio}
        value={formatLogEntityLabel(getValue<string>())}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
      />
    ),
    size: 160,
    meta: {
      exportValue: (row) => formatLogEntityLabel(row.scope),
    },
  },
  {
    accessorFn: (row) => row.occurredAt,
    id: "occurredAt",
    header: "Occurred At",
    cell: ({ getValue }) => {
      const value = getValue<string>();
      return (
        <TableCellItem
          icon={Calendar}
          value={
            value ? DateTime.fromISO(value).toFormat("dd-MM-yyyy HH:mm") : "N/A"
          }
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      );
    },
    size: 180,
  },
  {
    id: "actions",
    header: "Actions",
    size: 120,
    cell: ({ row }) => (
      <ViewOnlyActionButton
        perms={perms}
        viewHref={`${basePath}/${row.original.id}`}
      />
    ),
  },
];
