import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Image from "next/image";

import { Clinic, ClinicCategory, ClinicManager } from "@cosmediate/type-utils";
import { cn } from "@cosmediate/ui/lib/utils";

import { CrudActionButtons } from "@app/components/table/CrudActionButtons";
import TableCellItem from "@app/components/table/TableCellItem";

import {
  FiMail as Mail,
  FiPhone as Phone,
  FiShield as Shield,
} from "react-icons/fi";
import { FiCalendar as Calendar } from "react-icons/fi";
import { Tag, Hash, Check, X, Building2 } from "lucide-react";

export const ClinicCategoryColumnsData = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
): ColumnDef<ClinicCategory>[] => {
  return [
    {
      id: "category-name",
      header: "Name",
      accessorFn: (row) => row.name,
      cell: ({ getValue }) => {
        return (
          <TableCellItem
            icon={<Tag className="h-4 w-4 text-gray-400" />}
            value={getValue<string>() || "N/A"}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
            valueClassName="capitalize font-medium"
          />
        );
      },
      size: 200,
    },
    {
      accessorFn: (row) => row?.published,
      id: "published",
      header: "Status",
      cell: ({ getValue }) => {
        const published = getValue<boolean>();
        const valueClassName = [
          "capitalize font-medium px-2.5 py-1 rounded-full",
          published
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-gray-100 text-gray-800 hover:bg-gray-100",
        ];
        return (
          <TableCellItem
            icon={
              published ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <X className="h-3 w-3 mr-1" />
              )
            }
            value={published ? "Published" : "Unpublished"}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
            valueClassName={valueClassName.join(" ")}
          />
        );
      },
      size: 200,
    },
    {
      accessorFn: (row) => row?.clinicCount ?? 0,
      id: "clinicCount",
      header: "Clinics",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={<Building2 className="h-4 w-4 text-blue-400" />}
          value={getValue<number>() ?? 0}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 150,
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
          resource="clinic_category"
          viewHref={`/clinic-management/categories/${row.original.id}`}
          editHref={`/clinic-management/categories/update/${row.original.id}`}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];
};

export const ManagerDataColumns = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
): ColumnDef<ClinicManager>[] => {
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
      size: 150,
    },
    {
      accessorFn: (row) => row?.clinicCount as number,
      id: "clinic-count",
      header: "Clinic Count",
      cell: ({ getValue }) => {
        const clinicCount = getValue<number>();

        return (
          <TableCellItem
            icon={<Hash className="h-4 w-4 text-blue-400" />}
            value={clinicCount}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 150,
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
          resource="clinic_manager"
          viewHref={`/clinic-management/managers/${row.original.id}`}
          editHref={`/clinic-management/managers/update/${row.original.id}`}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];
};

export const ClinicsDataColumns = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
): ColumnDef<Clinic>[] => {
  return [
    {
      id: "name",
      header: "Clinic Name",
      accessorFn: (row) => row,
      cell: ({ row }) => {
        const data = row.original;
        const name = data?.name as string;
        const image = data?.logo || "/placeholder.jpg";

        return (
          <TableCellItem
            icon={
              <div className="w-8 h-8 aspect-square shrink-0 rounded-full overflow-hidden bg-white p-0.5 border border-primary-accent flex items-center justify-center">
                <Image
                  src={image}
                  alt={name || "Clinic Logo"}
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
      accessorFn: (row) => row?.clinicType as string,
      id: "type",
      header: "Type",
      cell: ({ getValue }) => {
        return (
          <TableCellItem
            icon={<Building2 className="h-4 w-4 text-amber-500" />}
            value={getValue<string>()}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
    },
    {
      accessorFn: (row) => row?.managerCount as number,
      id: "manager-count",
      header: "Manager Count",
      cell: ({ getValue }) => {
        const managerCount = getValue<number>();

        return (
          <TableCellItem
            icon={<Hash className="h-4 w-4 text-blue-400" />}
            value={managerCount}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 150,
    },
    {
      accessorFn: (row) => row?.specialistCount as number,
      id: "specialist-count",
      header: "Specialist Count",
      cell: ({ getValue }) => {
        const specialistCount = getValue<number>();

        return (
          <TableCellItem
            icon={<Hash className="h-4 w-4 text-blue-400" />}
            value={specialistCount}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 150,
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
          resource="clinic"
          viewHref={`/clinic-management/${row.original.id}`}
          editHref={`/clinic-management/update/${row.original.id}`}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];
};
