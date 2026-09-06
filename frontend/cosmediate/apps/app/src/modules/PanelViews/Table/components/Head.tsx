import React from "react";
import { flexRender, Table, Header } from "@tanstack/react-table";

import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { LiaSortSolid } from "react-icons/lia";

interface TableHeadProps<TData> {
  table: Table<TData>;
}

export function TableHead<TData>({ table }: TableHeadProps<TData>) {
  return (
    <thead className="sticky top-0 z-50 bg-white shadow">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => {
            const isPinned = header.column.getIsPinned();
            const pinnedPosition = isPinned
              ? header.column.getStart(isPinned)
              : undefined;
            // const isFirstColumn = index === 0;
            // const isLastColumn = index === headerGroup.headers.length - 1;

            return (
              <th
                key={header.id}
                style={{
                  width: header.getSize(),
                  position: isPinned ? "sticky" : "relative",
                  left: isPinned === "left" ? `${pinnedPosition}px` : undefined,
                  right:
                    isPinned === "right" ? `${pinnedPosition}px` : undefined,
                  zIndex: isPinned ? 20 : 1,
                }}
                className={`text-left text-xs text-400 font-normal py-2 border-b whitespace-nowrap select-none ${
                  isPinned
                    ? isPinned === "left"
                      ? "bg-ghost-blue shadow-sm pl-4 pr-6"
                      : "bg-ghost-blue shadow-sm pl-6 pr-4"
                    : "px-4"
                }`}
              >
                {header.isPlaceholder ? null : (
                  <div
                    className={`flex items-center ${header.column.getCanSort() ? "cursor-pointer" : ""}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span className="ml-1">
                        {header.column.getIsSorted() === "asc" ? (
                          <IoIosArrowUp className="size-3 text-600" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <IoIosArrowDown className="size-3 text-600" />
                        ) : (
                          <LiaSortSolid className="size-3 text-600 hidden" />
                        )}
                      </span>
                    )}
                  </div>
                )}
                {header.column.getCanResize() && (
                  <ResizeHandle header={header} />
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}

interface ResizeHandleProps<TData, TValue> {
  header: Header<TData, TValue>;
}

function ResizeHandle<TData, TValue>({
  header,
}: ResizeHandleProps<TData, TValue>) {
  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      className="absolute right-0 top-0 h-full w-4 cursor-col-resize select-none touch-none group flex items-center justify-center"
    >
      <div
        className={`h-4/5 w-0.5 bg-300 group-hover:bg-primary-accent ${
          header.column.getIsResizing() ? "bg-primary-accent w-1" : ""
        }`}
      />
    </div>
  );
}
