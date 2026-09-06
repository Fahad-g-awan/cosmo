import { ColumnDef } from "@tanstack/react-table";

import { Lead, LeadStatus } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { CrudActionButtons } from "@app/components/table/CrudActionButtons";
import TableCellItem from "@app/components/table/TableCellItem";

import {
  FiMail as Mail,
  FiPhone as Phone,
  FiUser as User,
  FiCalendar as Calendar,
  FiTag as Tag,
  FiGlobe as Globe,
} from "react-icons/fi";
import { DateTime } from "luxon";

const statusColors: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  CONTACTED: "bg-purple-100 text-purple-800",
  QUALIFIED: "bg-indigo-100 text-indigo-800",
  CONVERTED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
};

const typeColors: Record<string, string> = {
  SUBSCRIPTION: "bg-cyan-100 text-cyan-800",
  CONTACT: "bg-orange-100 text-orange-800",
  DOCTOR: "bg-emerald-100 text-emerald-800",
  CLINIC: "bg-violet-100 text-violet-800",
};

export const ClientLeadDataColumns = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
): ColumnDef<Lead>[] => {
  return [
    {
      id: "email",
      header: "Email",
      accessorFn: (row) => row.email,
      cell: ({ row }) => {
        const email = row.original?.email as string;
        return (
          <TableCellItem
            icon={Mail}
            value={email}
            valueClassName="font-medium line-clamp-1"
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 220,
    },
    {
      accessorFn: (row) => row,
      id: "fullName",
      header: "Name",
      cell: ({ row }) => {
        const data = row?.original;
        const fullName = `${data?.firstName} ${data?.lastName}`;

        return (
          <TableCellItem
            icon={User}
            value={fullName}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 200,
    },
    {
      accessorFn: (row) => row?.phone as string,
      id: "phone",
      header: "Phone",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={Phone}
          value={getValue<string>()}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
    },
    {
      accessorFn: (row) => row?.type as string,
      id: "type",
      header: "Type",
      cell: ({ getValue }) => {
        const type = getValue<string>();

        return (
          <TableCellItem
            value={type?.replace(/_/g, " ") || "N/A"}
            className={"inline-flex px-2 py-1 rounded-full text-xs"}
            valueClassName={cn(
              "px-2 py-1 rounded-full text-[10px] uppercase",
              typeColors[type] || "bg-100 text-800",
            )}
          />
        );
      },
      size: 150,
    },
    {
      accessorFn: (row) => row?.status as string,
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue<string>();

        return (
          <TableCellItem
            value={status?.replace(/_/g, " ") || "N/A"}
            className={"inline-flex px-2 py-1 rounded-full text-xs"}
            valueClassName={cn(
              "px-2 py-1 rounded-full text-[10px] uppercase",
              statusColors[status as LeadStatus] || "bg-100 text-800",
            )}
          />
        );
      },
      size: 150,
    },
    {
      accessorFn: (row) => row?.source as string,
      id: "source",
      header: "Source",
      cell: ({ getValue }) => {
        const source = getValue<string>();
        return (
          <TableCellItem
            icon={Globe}
            value={source?.replace(/_/g, " ")}
            iconClassName="h-4 w-4 text-blue-500"
          />
        );
      },
      size: 200,
    },
    {
      accessorFn: (row) => row?.subject as string,
      id: "subject",
      header: "Subject",
      cell: ({ getValue }) => {
        const subject = getValue<string>();
        return (
          <TableCellItem
            icon={Tag}
            value={subject}
            iconClassName="h-4 w-4 text-400"
          />
        );
      },
      size: 180,
    },
    {
      accessorFn: (row) => row.createdAt as string,
      id: "createdAt",
      header: "Created At",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={Calendar}
          value={DateTime.fromISO(getValue<string>()).toFormat(
            "dd-MM-yyyy HH:mm",
          )}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 200,
    },
    {
      accessorFn: (row) => row.updatedAt as string,
      id: "updatedAt",
      header: "Updated At",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={Calendar}
          value={DateTime.fromISO(getValue<string>()).toFormat(
            "dd-MM-yyyy HH:mm",
          )}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 200,
    },

    {
      id: "actions",
      header: "Actions",
      size: 200,
      cell: ({ row }) => (
        <CrudActionButtons
          perms={perms}
          resource="lead"
          viewHref={`/crm/leads/${row.original.id}`}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];
};
