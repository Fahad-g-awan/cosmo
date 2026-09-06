import type { ColumnDef } from "@tanstack/react-table";
import React, { useMemo } from "react";

import {
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@cosmediate/ui";

interface ColumnToggleSectionProps<T> {
  columns: ColumnDef<T>[];
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

export const ColumnToggleSection = <T,>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
}: ColumnToggleSectionProps<T>) => {
  const hideableColumns = useMemo(() => {
    return columns.filter((col) => {
      const colId =
        (col as { id?: string }).id ||
        (col as { accessorKey?: string }).accessorKey;
      return colId && colId !== "actions" && colId !== "select";
    });
  }, [columns]);

  if (hideableColumns.length === 0) return null;

  return (
    <>
      <DropdownMenuLabel className="text-700 text-sm">
        Toggle Columns
      </DropdownMenuLabel>
      {hideableColumns.map((column) => {
        const colId =
          (column as { id?: string }).id ||
          (column as { accessorKey?: string }).accessorKey ||
          "";
        const header =
          typeof column.header === "string" ? column.header : colId;
        const isVisible = columnVisibility[colId] !== false;

        return (
          <DropdownMenuCheckboxItem
            key={colId}
            checked={isVisible}
            onCheckedChange={(checked) =>
              onColumnVisibilityChange(colId, !!checked)
            }
            className="text-700 text-sm cursor-pointer"
          >
            {header}
          </DropdownMenuCheckboxItem>
        );
      })}
    </>
  );
};
