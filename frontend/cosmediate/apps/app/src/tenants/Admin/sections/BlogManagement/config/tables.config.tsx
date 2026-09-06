import { ColumnDef } from "@tanstack/react-table";
import { DateTime } from "luxon";
import Image from "next/image";

import { BlogCategory } from "@cosmediate/type-utils";
import { Blog } from "@cosmediate/type-utils";

import { CrudActionButtons } from "@app/components/table/CrudActionButtons";
import TableCellItem from "@app/components/table/TableCellItem";

import { FiGrid as Building2, FiCalendar as Calendar } from "react-icons/fi";
import { Tag, FileText, Hash, Check, X, User } from "lucide-react";

export const BlogColumnsData = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
): ColumnDef<Blog>[] => {
  return [
    {
      id: "title",
      header: "Title",
      accessorFn: (row) => row,
      cell: ({ row }) => {
        const title = row.original?.title as string;
        const image = (row.original?.image as string) || "/placeholder.jpg";

        return (
          <TableCellItem
            icon={
              <div className="w-8 h-8 aspect-square shrink-0 rounded-full overflow-hidden bg-white p-0.5 border border-primary-accent flex items-center justify-center">
                <Image
                  src={image}
                  alt={title}
                  width={100}
                  height={100}
                  className="object-cover h-full w-full rounded-full"
                />
              </div>
            }
            value={title}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
            valueClassName="font-medium capitalize"
          />
        );
      },
      size: 200,
    },
    {
      accessorFn: (row) => row?.categoryName as string,
      id: "categoryName",
      header: "Category",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={<Tag className="h-4 w-4 text-gray-400" />}
          value={getValue<string>() || "N/A"}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 200,
    },
    {
      accessorFn: (row) => row?.authorName as string,
      id: "authorName",
      header: "Author",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={<User className="h-4 w-4 text-gray-400" />}
          value={getValue<string>() || "N/A"}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
      size: 180,
    },
    {
      accessorFn: (row) => row?.overview as string,
      id: "overview",
      header: "Overview",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={<FileText className="h-4 w-4 text-gray-400" />}
          value={getValue<string>() || "N/A"}
          className={viewMode === "grid" ? "justify-end" : "justify-start"}
        />
      ),
    },
    {
      accessorFn: (row) => row?.status as string,
      id: "status",
      header: "Status",
      cell: ({ getValue }) => {
        return (
          <TableCellItem
            icon={<Building2 className="h-4 w-4 text-gray-400" />}
            value={getValue<string>() || "N/A"}
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
    },
    {
      accessorFn: (row) => row?.publishedAt || "",
      id: "publishedAt",
      header: "Published At",
      cell: ({ getValue }) => {
        return (
          <TableCellItem
            icon={<Calendar className="h-4 w-4 text-gray-400" />}
            value={
              DateTime.fromISO(getValue<string>()).toFormat(
                "dd-MM-yyyy HH:mm",
              ) || "N/A"
            }
            className={viewMode === "grid" ? "justify-end" : "justify-start"}
          />
        );
      },
      size: 200,
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
          resource="blog"
          viewHref={`/blog-management/${row.original.id}`}
          editHref={`/blog-management/update/${row.original.id}`}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];
};

export const BlogCategoryColumnsData = (
  handleDelete: (id: string) => void,
  viewMode: string,
  perms: string[] = [],
): ColumnDef<BlogCategory>[] => {
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
      accessorFn: (row) => row?.blogCount ?? 0,
      id: "blogCount",
      header: "Blogs",
      cell: ({ getValue }) => (
        <TableCellItem
          icon={<Hash className="h-4 w-4 text-blue-400" />}
          value={getValue<number>() || "N/A"}
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
          resource="blog_category"
          viewHref={`/blog-management/categories/${row.original.id}`}
          editHref={`/blog-management/categories/update/${row.original.id}`}
          onDelete={() => handleDelete(row.original.id)}
        />
      ),
    },
  ];
};
