import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Image from "next/image";

import { Specialist } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { CrudActionButtons } from "@app/components/table/CrudActionButtons";
import TableCellItem from "@app/components/table/TableCellItem";

import { FiMail as Mail, FiPhone as Phone } from "react-icons/fi";
import { FiCalendar as Calendar } from "react-icons/fi";
import {
  Building2,
  Check,
  MapPin,
  Star,
  X,
} from "lucide-react";

const formatWorkingType = (value?: string) => {
  if (value === "FULL_TIME") return "Full time";
  if (value === "FREELANCE") return "Freelance";
  return value ?? "—";
};

export const SpecialistsDataColumns = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
  options: { readOnlyFreelance?: boolean } = {},
): ColumnDef<Specialist>[] => {
  const { readOnlyFreelance = false } = options;

  return [
    {
      id: "name",
      header: "Specialist Name",
      accessorFn: (row) => row,
      cell: ({ row }) => {
        const data = row.original;
        const name = data?.fullName as string;
        const image = data?.image || "/avatar.jpg";

        return (
          <TableCellItem
            icon={
              <div className="w-8 h-8 aspect-square shrink-0 rounded-full overflow-hidden bg-white p-0.5 border border-primary-accent flex items-center justify-center">
                <Image
                  src={image}
                  alt={name || "Specialist Logo"}
                  width={100}
                  height={100}
                  className="object-cover h-full w-full rounded-full"
                />
              </div>
            }
            value={name}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
            valueClassName="font-medium capitalize"
          />
        );
      },
      size: 220,
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
      size: 220,
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
      size: 200,
    },
    {
      accessorFn: (row) => row?.status,
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const isActive = status === "ACTIVE";
        return (
          <TableCellItem
            icon={
              isActive ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <X className="h-3 w-3 text-gray-500" />
              )
            }
            value={status ?? "—"}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
            valueClassName={cn(
              "capitalize font-medium px-2.5 py-1 rounded-full text-xs",
              isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800",
            )}
          />
        );
      },
      size: 140,
    },
    {
      accessorFn: (row) => row?.available,
      id: "available",
      header: "Available",
      cell: ({ getValue }) => {
        const available = getValue<boolean>();
        return (
          <TableCellItem
            icon={
              available ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <X className="h-3 w-3 text-gray-500" />
              )
            }
            value={available ? "Yes" : "No"}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 120,
    },
    {
      accessorFn: (row) => row?.workingType,
      id: "type",
      header: "Working Type",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={<Building2 className="h-4 w-4 text-amber-500" />}
          value={formatWorkingType(getValue<string>())}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 140,
    },
    {
      accessorFn: (row) => row?.gender,
      id: "gender",
      header: "Gender",
      cell: ({ getValue }) => (
        <TableCellItem
          value={getValue<string>() ?? "—"}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
          valueClassName="capitalize"
        />
      ),
      size: 120,
    },
    {
      accessorFn: (row) => row?.city,
      id: "city",
      header: "City",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={<MapPin className="h-4 w-4 text-gray-400" />}
          value={getValue<string>() ?? "—"}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 140,
    },
    {
      accessorFn: (row) => row?.totalExperience,
      id: "experience",
      header: "Experience",
      cell: ({ getValue }) => {
        const years = getValue<number | string>();
        return (
          <TableCellItem
            value={years != null && years !== "" ? `${years} yrs` : "—"}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 120,
    },
    {
      accessorFn: (row) => row?.avgRating,
      id: "rating",
      header: "Rating",
      cell: ({ getValue }) => {
        const rating = getValue<number>();
        return (
          <TableCellItem
            icon={<Star className="h-4 w-4 text-amber-500" />}
            value={rating != null ? rating.toFixed(1) : "—"}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 110,
    },
    {
      accessorFn: (row) => row?.clinicCount,
      id: "clinicCount",
      header: "Clinics",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={<Building2 className="h-4 w-4 text-blue-400" />}
          value={getValue<number>() ?? 0}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 100,
    },
    {
      accessorFn: (row) => row?.reviewCount,
      id: "reviews",
      header: "Reviews",
      cell: ({ getValue }) => (
        <TableCellItem
          value={getValue<number>() ?? 0}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 100,
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
        const isFreelanceReadOnly =
          readOnlyFreelance && row.original.workingType === "FREELANCE";

        return (
          <CrudActionButtons
            perms={perms}
            resource="specialist"
            viewHref={`/specialists/${row.original.id}`}
            editHref={
              isFreelanceReadOnly
                ? undefined
                : `/specialists/update/${row.original.id}`
            }
            onDelete={
              isFreelanceReadOnly
                ? undefined
                : () => handleDelete(row.original.id)
            }
          />
        );
      },
    },
  ];
};
