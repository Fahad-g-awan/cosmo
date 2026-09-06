"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAuth } from "@cosmediate/auth";
import { Toaster } from "@cosmediate/ui";

import { buildExportSnapshot } from "./build-export-snapshot";
import type { ExportFormat, ListExportRegistration } from "./types";

interface ListExportContextType {
  register: (registration: ListExportRegistration) => void;
  unregister: (slug: string) => void;
  exportList: (format: ExportFormat) => Promise<void>;
  canExport: boolean;
  isExporting: boolean;
}

const ListExportContext = createContext<ListExportContextType | null>(null);

export const ListExportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [canExport, setCanExport] = useState(false);

  const registrationRef = useRef<ListExportRegistration | null>(null);
  const { sessionUser } = useAuth();

  const refreshCanExport = useCallback(() => {
    const registration = registrationRef.current;
    setCanExport(Boolean(registration?.items.length));
  }, []);

  const register = useCallback(
    (registration: ListExportRegistration) => {
      registrationRef.current = registration;
      refreshCanExport();
    },
    [refreshCanExport],
  );

  const unregister = useCallback((slug: string) => {
    if (registrationRef.current?.slug === slug) {
      registrationRef.current = null;
      setCanExport(false);
    }
  }, []);

  const exportList = useCallback(
    async (format: ExportFormat) => {
      const registration = registrationRef.current;
      if (!registration?.items.length) {
        Toaster(
          "Nothing to export",
          "error",
          "This page has no rows to export.",
        );
        return;
      }

      const exportedBy = sessionUser
        ? `${sessionUser.fullName || "User"} · ${sessionUser.email}`
        : "Unknown user";

      const generatedAt = new Date().toISOString();
      const snapshot = buildExportSnapshot(
        registration,
        exportedBy,
        generatedAt,
      );

      setIsExporting(true);
      try {
        if (format === "pdf") {
          const { exportToPdf } = await import("./export-pdf");
          await exportToPdf(snapshot);
        } else {
          const { exportToExcel } = await import("./export-excel");
          await exportToExcel(snapshot);
        }
        Toaster("Export ready", "success", "Your file download has started.");
      } catch (error) {
        console.error("[ListExport] export failed:", error);
        Toaster(
          "Export failed",
          "error",
          "Please try again or contact support.",
        );
      } finally {
        setIsExporting(false);
      }
    },
    [sessionUser],
  );

  const value = useMemo(
    () => ({
      register,
      unregister,
      exportList,
      canExport,
      isExporting,
    }),
    [register, unregister, exportList, canExport, isExporting],
  );

  return (
    <ListExportContext.Provider value={value}>
      {children}
    </ListExportContext.Provider>
  );
};

export const useListExport = (): ListExportContextType => {
  const context = useContext(ListExportContext);
  if (!context) {
    throw new Error("useListExport must be used within ListExportProvider");
  }
  return context;
};

export const useListExportOptional = (): ListExportContextType | null => {
  return useContext(ListExportContext);
};
