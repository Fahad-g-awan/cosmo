"use client";

import { useEffect } from "react";

import { usePanelHeader } from "@app/layout/management/context";
import type { PanelHeaderConfig } from "@app/types/shared";
import { usePermissions } from "@app/hooks/usePermissions";
import { hasPermission } from "@app/lib/permissions";

const PLATFORM_LOGS_GRANT = "platform:logs";

export const usePlatformLogsPanelHeader = (
  base: PanelHeaderConfig | undefined,
) => {
  const { setPanelHeaderConfig } = usePanelHeader();
  const { perms } = usePermissions();

  useEffect(() => {
    if (!base) return;

    const canViewLogs = hasPermission(perms, PLATFORM_LOGS_GRANT);

    setPanelHeaderConfig({
      ...base,
      showActions: Boolean(base.showActions && canViewLogs),
      showSearch: Boolean(base.showSearch && canViewLogs),
      showExportBtn: Boolean(base.showExportBtn && canViewLogs),
      showAddBtn: Boolean(base.showAddBtn && canViewLogs),
    });
  }, [base, perms, setPanelHeaderConfig]);
};
