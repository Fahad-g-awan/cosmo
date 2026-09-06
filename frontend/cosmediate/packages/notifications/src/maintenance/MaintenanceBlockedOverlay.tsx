"use client";

import { AlertTriangle } from "lucide-react";

import { MaintenanceAdminRecoveryPanel } from "./MaintenanceAdminRecoveryPanel";

interface MaintenanceBlockedOverlayProps {
  message: string;
  showAdminRecovery?: boolean;
}

export const MaintenanceBlockedOverlay = ({
  message,
  showAdminRecovery = false,
}: MaintenanceBlockedOverlayProps) => {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/95 p-6 backdrop-blur-sm">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle className="size-6" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Maintenance in progress
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message}
        </p>
        {showAdminRecovery ? <MaintenanceAdminRecoveryPanel /> : null}
      </div>
    </div>
  );
};
