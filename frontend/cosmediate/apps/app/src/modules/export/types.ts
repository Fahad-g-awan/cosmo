import type { ColumnDef } from "@tanstack/react-table";

export type ExportFormat = "pdf" | "excel";

export interface ListExportConfig {
  slug: string;
  title?: string;
}

export interface ExportSnapshot {
  title: string;
  slug: string;
  headers: string[];
  rows: string[][];
  filterLines: string[];
  sortLine: string | null;
  exportedBy: string;
  generatedAt: string;
}

export interface ListExportRegistration<T = unknown> {
  slug: string;
  title: string;
  columns: ColumnDef<T>[];
  items: T[];
  columnVisibility: Record<string, boolean>;
  getFilterSummary: () => { filterLines: string[]; sortLine: string | null };
}

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    exportValue?: (row: TData) => string | number | boolean | null | undefined;
    skipExport?: boolean;
  }
}
