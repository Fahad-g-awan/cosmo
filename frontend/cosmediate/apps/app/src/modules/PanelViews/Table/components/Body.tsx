import { flexRender, Table } from "@tanstack/react-table";
import React from "react";

interface TableBodyProps<TData> {
  table: Table<TData>;
  onRowClick?: (row: TData) => void;
  isLoading: boolean;
}

export function TableBody<TData>({
  table,
  onRowClick,
  // isLoading,
}: TableBodyProps<TData>) {
  // if (true) {
  //   return (
  //     <tbody>
  //       <tr>
  //         <td
  //           colSpan={table.getAllColumns().length}
  //           className="text-center py-15"
  //         >
  //           <SmallLoader showText={false} />
  //         </td>
  //       </tr>
  //     </tbody>
  //   );
  // }

  // if (table.getRowModel().rows.length === 0 && !isLoading) {
  //   return (
  //     <tbody>
  //       <tr>
  //         <td
  //           colSpan={table.getAllColumns().length}
  //           className="text-center py-15"
  //         >
  //           <div className="flex flex-col items-center justify-center gap-3">
  //             <MdOutlineSpaceDashboard className="size-6 text-500" />
  //             <p className="text-xs text-600">Data Not Found</p>
  //           </div>
  //         </td>
  //       </tr>
  //     </tbody>
  //   );
  // }

  const rows = table.getRowModel().rows;

  return (
    <tbody>
      {rows.map((row, rowIndex) => {
        const isLastRow = rowIndex === rows.length - 1;

        return (
          <tr
            key={row.id}
            className={`!hover:bg-muted/50 ${onRowClick ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => onRowClick && onRowClick(row.original)}
          >
            {row.getVisibleCells().map((cell) => {
              const isPinned = cell.column.getIsPinned();
              const pinnedPosition = isPinned
                ? cell.column.getStart(isPinned)
                : undefined;
              // const isFirstColumn = cellIndex === 0;
              // const isLastColumn =
              //   cellIndex === row.getVisibleCells().length - 1;

              return (
                <td
                  key={cell.id}
                  className={`text-xs text-700 py-2 whitespace-nowrap ${
                    !isLastRow ? "border-b" : "mb-4"
                  } 
                   ${
                     isPinned
                       ? isPinned === "left"
                         ? "bg-ghost-blue shadow-sm pl-4 pr-6"
                         : "bg-ghost-blue shadow-sm pl-6 pr-4"
                       : "bg-white px-4"
                   }`}
                  style={{
                    width: cell.column.getSize(),
                    position: isPinned ? "sticky" : "relative",
                    left:
                      isPinned === "left" ? `${pinnedPosition}px` : undefined,
                    right:
                      isPinned === "right" ? `${pinnedPosition}px` : undefined,
                    zIndex: isPinned ? 10 : 1,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}
