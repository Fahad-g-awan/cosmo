import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import { Calendar, Hash, Megaphone, User } from "lucide-react";

import { Announcement } from "@cosmediate/type-utils";

import { CrudActionButtons } from "@app/components/table/CrudActionButtons";
import TableCellItem from "@app/components/table/TableCellItem";

export const AnnouncementColumnsData = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
): ColumnDef<Announcement>[] => [
  {
    id: "title",
    header: "Title",
    accessorFn: (row) => row.title,
    cell: ({ getValue }) => (
      <TableCellItem
        icon={<Megaphone className="h-4 w-4 text-gray-400" />}
        value={getValue<string>()}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
        valueClassName="font-medium"
      />
    ),
    size: 220,
  },
  {
    id: "severity",
    header: "Severity",
    accessorFn: (row) => row.severity,
    cell: ({ getValue }) => (
      <TableCellItem
        icon={<Hash className="h-4 w-4 text-gray-400" />}
        value={getValue<string>()}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
      />
    ),
    size: 120,
  },
  {
    id: "status",
    header: "Status",
    accessorFn: (row) => row.status,
    cell: ({ getValue }) => (
      <TableCellItem
        icon={<Hash className="h-4 w-4 text-gray-400" />}
        value={getValue<string>()}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
      />
    ),
    size: 120,
  },
  {
    id: "priority",
    header: "Priority",
    accessorFn: (row) => row.priority,
    cell: ({ getValue }) => (
      <TableCellItem
        icon={<Hash className="h-4 w-4 text-gray-400" />}
        value={String(getValue<number>() ?? 0)}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
      />
    ),
    size: 100,
  },
  {
    id: "authorName",
    header: "Author",
    accessorFn: (row) => row.authorName,
    cell: ({ getValue }) => (
      <TableCellItem
        icon={<User className="h-4 w-4 text-gray-400" />}
        value={getValue<string>() || "N/A"}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
      />
    ),
    size: 160,
  },
  {
    id: "startsAt",
    header: "Starts",
    accessorFn: (row) => row.startsAt,
    cell: ({ getValue }) => {
      const value = getValue<string | null>();
      return (
        <TableCellItem
          icon={<Calendar className="h-4 w-4 text-gray-400" />}
          value={
            value
              ? DateTime.fromISO(value).toFormat("dd-MM-yyyy HH:mm")
              : "Always"
          }
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      );
    },
    size: 180,
  },
  {
    id: "updatedAt",
    header: "Updated",
    accessorFn: (row) => row.updatedAt,
    cell: ({ getValue }) => (
      <TableCellItem
        icon={<Calendar className="h-4 w-4 text-gray-400" />}
        value={DateTime.fromISO(getValue<string>()).toFormat(
          "dd-MM-yyyy HH:mm",
        )}
        className={viewMode === "grid" ? "justify-end" : "justify-start"}
      />
    ),
    size: 180,
  },
  {
    id: "actions",
    header: "Actions",
    size: 200,
    cell: ({ row }) => (
      <CrudActionButtons
        perms={perms}
        resource="announcement"
        editHref={`/settings/platform/announcements/update/${row.original.id}`}
        onDelete={() => handleDelete(row.original.id)}
      />
    ),
  },
];
