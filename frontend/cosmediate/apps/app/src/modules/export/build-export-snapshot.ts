import type { ColumnDef } from "@tanstack/react-table";

import type { ExportSnapshot, ListExportRegistration } from "./types";
import { buildFilterSummary } from "./build-filter-summary";
import { formatCellValue } from "./format-cell-value";

function getColumnHeader<T>(column: ColumnDef<T>): string {
  const header = column.header;
  if (typeof header === "string") return header;
  return column.id ?? "";
}

function isExportableColumn<T>(column: ColumnDef<T>): boolean {
  if (!column.id || column.id === "actions") return false;
  if (column.meta?.skipExport) return false;
  return true;
}

function isColumnVisible(
  columnId: string,
  columnVisibility: Record<string, boolean>,
): boolean {
  if (!(columnId in columnVisibility)) return true;
  return columnVisibility[columnId] !== false;
}

function getExportCellValue<T>(column: ColumnDef<T>, row: T): string {
  if (column.meta?.exportValue) {
    return formatCellValue(column.meta.exportValue(row));
  }

  if ("accessorFn" in column && typeof column.accessorFn === "function") {
    return formatCellValue(column.accessorFn(row, 0));
  }

  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    const keys = column.accessorKey.split(".");
    let value: unknown = row;
    for (const key of keys) {
      value = (value as Record<string, unknown> | undefined)?.[key];
    }
    return formatCellValue(value);
  }

  return "";
}

export function buildExportSnapshot<T>(
  registration: ListExportRegistration<T>,
  exportedBy: string,
  generatedAt: string,
): ExportSnapshot {
  const visibleColumns = registration.columns.filter(
    (column) =>
      isExportableColumn(column) &&
      isColumnVisible(column.id as string, registration.columnVisibility),
  );

  const headers = visibleColumns.map(getColumnHeader);
  const rows = registration.items.map((item) =>
    visibleColumns.map((column) => getExportCellValue(column, item)),
  );

  const { filterLines, sortLine } = registration.getFilterSummary();

  return {
    title: registration.title,
    slug: registration.slug,
    headers,
    rows,
    filterLines,
    sortLine,
    exportedBy,
    generatedAt,
  };
}

export { buildFilterSummary };
