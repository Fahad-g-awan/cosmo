"use client";

import { useEffect } from "react";

import { usePanelHeader } from "@app/layout/management/context";
import { resolvePanelHeaderConfig } from "@app/lib/permissions";
import type { PanelHeaderConfig } from "@app/types/shared";
import { usePermissions } from "@app/hooks/usePermissions";

export const useGatedPanelHeader = (
  base: PanelHeaderConfig | undefined,
  resource: string,
) => {
  const { setPanelHeaderConfig } = usePanelHeader();
  const { perms, registry } = usePermissions();

  useEffect(() => {
    if (!base) return;
    setPanelHeaderConfig(
      resolvePanelHeaderConfig(base, perms, resource, registry),
    );
  }, [base, perms, registry, resource, setPanelHeaderConfig]);
};
