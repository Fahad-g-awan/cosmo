import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";

import { Admin } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

import { CrudActionButtons } from "@app/components/table/CrudActionButtons";
import TableCellItem from "@app/components/table/TableCellItem";
import { hasPermission } from "@app/lib/permissions";

import {
  FiMail as Mail,
  FiPhone as Phone,
  FiCalendar as Calendar,
  FiShield as Shield,
} from "react-icons/fi";
import { ScrollText } from "lucide-react";

export const AdminsDataColumns = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
  currentAdminId?: string | null,
): ColumnDef<Admin>[] => {
  return [
    {
      accessorFn: (row) => row,
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const data = row.original;
        const fullName = data?.fullName as string;
        const image = (data?.image as string) || "/avatar.jpg";

        return (
          <TableCellItem
            icon={
              <div className="w-8 h-8 aspect-square shrink-0 rounded-full overflow-hidden bg-white p-0.5 border border-primary-accent flex items-center justify-center">
                <Image
                  src={image}
                  alt={fullName}
                  width={100}
                  height={100}
                  className="object-cover h-full w-full rounded-full"
                />
              </div>
            }
            value={fullName}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
            valueClassName="font-medium capitalize"
          />
        );
      },
      size: 300,
    },
    {
      accessorFn: (row) => row?.email as string,
      id: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={Mail}
          value={getValue<string>()}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
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
      accessorFn: (row) => row?.age as string,
      id: "age",
      header: "Age",
      cell: ({ getValue }) => (
        <TableCellItem
          value={getValue<string>()}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 80,
    },
    {
      accessorFn: (row) => row?.status as string,
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const statusColors: Record<string, string> = {
          ACTIVE: "bg-green-100 text-green-800",
          BLOCKED: "bg-red-100 text-red-800",
          PENDING: "bg-yellow-100 text-yellow-800",
        };

        return (
          <TableCellItem
            icon={Shield}
            value={status}
            className={viewMode === "grid" ? "justify-end" : "justify-between"}
            valueClassName={cn(
              "px-2 py-1 rounded-full text-[10px] uppercase",
              statusColors[status] || "bg-100 text-800",
            )}
          />
        );
      },
      size: 120,
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
      cell: ({ row }) => {
        const isSelf = Boolean(
          currentAdminId && row.original.id === currentAdminId,
        );

        return (
          <CrudActionButtons
            perms={perms}
            resource="admin"
            viewHref={`/control-panel/admins/${row.original.id}`}
            editHref={`/control-panel/admins/update/${row.original.id}`}
            onDelete={
              isSelf ? undefined : () => handleDelete(row.original.id)
            }
          />
        );
      },
    },
  ];
};

export const AdminAuditLogsPickerColumns = (
  viewMode: string,
  perms: string[] = [],
  logsBasePath = "/control-panel/audit-logs/for",
): ColumnDef<Admin>[] => {
  const canViewLogs = hasPermission(perms, "platform:logs");

  return [
    {
      accessorFn: (row) => row,
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const data = row.original;
        const fullName = data?.fullName as string;
        const image = (data?.image as string) || "/avatar.jpg";

        return (
          <TableCellItem
            icon={
              <div className="w-8 h-8 aspect-square shrink-0 rounded-full overflow-hidden bg-white p-0.5 border border-primary-accent flex items-center justify-center">
                <Image
                  src={image}
                  alt={fullName}
                  width={100}
                  height={100}
                  className="object-cover h-full w-full rounded-full"
                />
              </div>
            }
            value={fullName}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
            valueClassName="font-medium capitalize"
          />
        );
      },
      size: 300,
    },
    {
      accessorFn: (row) => row?.email as string,
      id: "email",
      header: "Email",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={Mail}
          value={getValue<string>()}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 240,
    },
    {
      accessorFn: (row) => row?.status as string,
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const statusColors: Record<string, string> = {
          ACTIVE: "bg-green-100 text-green-800",
          BLOCKED: "bg-red-100 text-red-800",
          PENDING: "bg-yellow-100 text-yellow-800",
        };

        return (
          <TableCellItem
            icon={Shield}
            value={status}
            className={viewMode === "grid" ? "justify-end" : "justify-between"}
            valueClassName={cn(
              "px-2 py-1 rounded-full text-[10px] uppercase",
              statusColors[status] || "bg-100 text-800",
            )}
          />
        );
      },
      size: 140,
    },
    {
      id: "actions",
      header: "Actions",
      size: 120,
      cell: ({ row }) => {
        if (!canViewLogs) return null;

        return (
          <div className="flex items-center justify-center">
            <Button variant="outline" className="p-0" asChild>
              <Link
                href={`${logsBasePath}/${row.original.id}`}
                className="text-primary-accent hover:text-primary-accent max-lg:bg-ghost-blue px-3 py-2.5 rounded-lg"
                title="View audit logs"
              >
                <ScrollText />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];
};
