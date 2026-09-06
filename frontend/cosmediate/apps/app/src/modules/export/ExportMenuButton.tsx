"use client";

import React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@cosmediate/ui";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Button } from "@cosmediate/ui/components/button";
import { cn } from "@cosmediate/ui/lib/utils";

import { useListExportOptional } from "./ListExportContext";
import type { ExportFormat } from "./types";

import { TbFileExport, TbFileSpreadsheet, TbFileTypePdf } from "react-icons/tb";

export const ExportMenuButton: React.FC = () => {
  const listExport = useListExportOptional();
  const { isMobileView } = useWindowWidth();

  if (!listExport) return null;

  const { exportList, canExport, isExporting } = listExport;

  const handleExport = (format: ExportFormat) => {
    void exportList(format);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={!canExport || isExporting}
          className={cn(
            "lg:min-w-[90px] flex items-center justify-center gap-2 py-2.5",
            "max-sm:p-0! max-sm:h-8 max-sm:w-8 max-sm:rounded-lg",
          )}
        >
          <TbFileExport className="size-4" />
          {!isMobileView && (
            <span className="font-bold text-xs text-700 leading-[17px] max-lg:hidden">
              {isExporting ? "Exporting…" : "Export"}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-lg">
        <DropdownMenuItem
          disabled={!canExport || isExporting}
          onSelect={() => handleExport("pdf")}
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          <TbFileTypePdf className="size-4 text-800 shrink-0" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!canExport || isExporting}
          onSelect={() => handleExport("excel")}
          className="flex items-center gap-2 cursor-pointer text-xs"
        >
          <TbFileSpreadsheet className="size-4 text-800 shrink-0" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
