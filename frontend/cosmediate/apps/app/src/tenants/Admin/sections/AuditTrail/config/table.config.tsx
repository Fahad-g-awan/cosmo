import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";

import type { AuditLog } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import {
  formatLogActionLabel,
  formatLogEntityLabel,
} from "@app/lib/platform-logs";
import { ViewOnlyActionButton } from "@app/components/table/ViewOnlyActionButton";
import TableCellItem from "@app/components/table/TableCellItem";

import {
  FiCalendar as Calendar,
  FiShield as Shield,
  FiUser as User,
  FiMail as Mail,
} from "react-icons/fi";
import { ScrollText } from "lucide-react";

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-50 text-emerald-700",
  UPDATE: "bg-amber-50 text-amber-700",
  DELETE: "bg-rose-50 text-rose-700",
  SOFT_DELETE: "bg-orange-50 text-orange-700",
};

export const AuditLogsDataColumns = (
  viewMode: string,
  perms: string[] = [],
  basePath = "/audit-trail",
): ColumnDef<AuditLog>[] => [
  {
    accessorFn: (row) => row.actorDisplayName,
    id: "actor",
    header: "Actor",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <TableCellItem
          icon={User}
          value={data.actorDisplayName || data.actorEmail || data.actorId}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
          valueClassName="font-medium capitalize"
        />
      );
    },
    size: 300,
  },
  {
    accessorFn: (row) => row.actorEmail,
    id: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <TableCellItem
        icon={Mail}
        value={getValue<string>() || "N/A"}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
      />
    ),
    size: 220,
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
    accessorFn: (row) => row.entity,
    id: "entity",
    header: "Entity",
    cell: ({ getValue }) => (
      <TableCellItem
        icon={ScrollText}
        value={formatLogEntityLabel(getValue<string>())}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
      />
    ),
    size: 180,
    meta: {
      exportValue: (row) => formatLogEntityLabel(row.entity),
    },
  },
  {
    accessorFn: (row) => row.actorRole,
    id: "actorRole",
    header: "Role",
    cell: ({ getValue }) => (
      <TableCellItem
        value={getValue<string>() || "N/A"}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
        valueClassName="uppercase text-[10px] font-semibold"
      />
    ),
    size: 120,
  },
  {
    accessorFn: (row) => row.createdAt,
    id: "createdAt",
    header: "Created At",
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
