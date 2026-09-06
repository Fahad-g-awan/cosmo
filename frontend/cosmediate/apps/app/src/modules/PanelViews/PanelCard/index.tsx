import { ColumnDef } from "@tanstack/react-table";
import React from "react";

import { cn } from "@cosmediate/ui/lib/utils";

interface PanelCardProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  onRowClick?: (row: TData) => void;
  className?: string;
}

const PanelCard = <TData extends Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  className,
}: PanelCardProps<TData>) => {
  const displayColumns = columns.filter((col) => col.id !== "actions");
  const actionsColumn = columns.find((col) => col.id === "actions");

  const getCellValue = (row: TData, column: ColumnDef<TData, unknown>) => {
    if (!column.id) return "N/A";

    if ("accessorFn" in column && typeof column.accessorFn === "function") {
      return column.accessorFn(row, 0);
    }

    return row[column.id] ?? "N/A";
  };

  const renderCellContent = (
    row: TData,
    column: ColumnDef<TData, unknown>,
  ): React.ReactNode => {
    const value = getCellValue(row, column);

    if (column.cell && typeof column.cell === "function") {
      try {
        const context = {
          row: { original: row },
          getValue: () => value,
        };

        // @ts-expect-error simplified context
        const result = column.cell(context);

        return result ?? "N/A";
      } catch (error) {
        console.error("Error rendering cell:", error);
      }
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return value;
    }

    if (value === null || value === undefined) {
      return "N/A";
    }

    return String(value);
  };

  return (
    <div
      className={cn(
        "w-full grid grid-cols-3 max-xl:grid-cols-2 max-sm:grid-cols-1 gap-5 items-center justify-center",
        className,
      )}
    >
      {data.map((row, rowIndex) => {
        return (
          <div
            key={rowIndex}
            className="overflow-hidden w-full bg-ghost-white rounded-2xl p-4 flex flex-col items-center justify-start gap-5"
            onClick={() => onRowClick && onRowClick(row)}
          >
            {/* Data Fields */}
            <div className="w-full bg-ghost-blue p-3 rounded-2xl flex flex-col items-center justify-between gap-5">
              {displayColumns.map((column, colIndex) => {
                const columnHeader =
                  typeof column.header === "string"
                    ? column.header
                    : (column.id as string);
                const columnValue = renderCellContent(row, column);

                return (
                  <div
                    key={colIndex}
                    className="w-full grid grid-cols-3 justify-center items-center gap-2 pb-5 last:pb-3 border-b border-stroke last:border-none"
                  >
                    <div className="w-full col-span-1 text-xs text-start text-500 uppercase truncate">
                      {columnHeader}
                    </div>
                    <div className="w-full col-span-2 text-xs flex justify-end items-center">
                      {columnValue}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="w-full flex justify-center items-center">
              {actionsColumn && (
                <div className="flex justify-center w-full">
                  {renderCellContent(row, actionsColumn)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PanelCard;
