"use client";

import { useMemo } from "react";

import type { UserRole } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { useWorkspace } from "@app/context/WorkspaceContext";

export type WorkspaceListTab = "patients" | "specialists" | "managers";

export interface UseWorkspaceListScopeOptions {
  tab: WorkspaceListTab;
}

export interface WorkspaceListScopeResult {
  /** Role + workspace scoped filters merged into POST list bodies. */
  listFilters: Record<string, unknown>;
  /** Stable key for browse pagination scope / refetch on clinic switch. */
  browseScopeKey: string;
  /** Suffix for panel-header context when active clinic matters. */
  panelHeaderKey: string;
  isScopeReady: boolean;
  scopeBlockedReason: string | null;
  /** When false, clinic switch should not refetch this tab (manager org-wide patients). */
  refetchOnClinicSwitch: boolean;
  /** Fields for patient create payloads (manager clinic junction). */
  createScope: Record<string, unknown>;
}

function requiresActiveClinic(
  role: UserRole | null | undefined,
  tab: WorkspaceListTab,
): boolean {
  return role === "MANAGER" && (tab === "patients" || tab === "specialists" || tab === "managers");
}

function buildListFilters(
  role: UserRole | null | undefined,
  tab: WorkspaceListTab,
  activeClinicId: string | null,
): Record<string, unknown> {
  if (role === "MANAGER") {
    if (tab === "patients" || tab === "specialists" || tab === "managers") {
      return activeClinicId ? { scopeClinicId: activeClinicId } : {};
    }
  }

  // Specialist patient list: backend auto-scopes via auth entityId — never send clinicId.
  if (role === "SPECIALIST" && tab === "patients") {
    return {};
  }

  return {};
}

function buildCreateScope(
  role: UserRole | null | undefined,
  activeClinicId: string | null,
): Record<string, unknown> {
  if (role === "MANAGER" && activeClinicId) {
    return { clinicId: activeClinicId };
  }
  return {};
}

/**
 * Role-aware list scope for clinic-dashboard browse tabs.
 * Admin/platform lists omit scoped filters; managers require activeClinicId.
 */
export function useWorkspaceListScope({
  tab,
}: UseWorkspaceListScopeOptions): WorkspaceListScopeResult {
  const { userRole, sessionUser } = useAuth();
  const { activeClinicId, scopeVersion, kind } = useWorkspace();

  const role = userRole ?? sessionUser?.role ?? null;

  return useMemo(() => {
    const needsClinic = requiresActiveClinic(role, tab);
    const isScopeReady =
      kind === "platform" || !needsClinic || Boolean(activeClinicId);

    const scopeBlockedReason =
      needsClinic && !activeClinicId
        ? "Select an active clinic to continue"
        : null;

    const listFilters = buildListFilters(role, tab, activeClinicId);
    const createScope = buildCreateScope(role, activeClinicId);

    const refetchOnClinicSwitch =
      role === "MANAGER" && (tab === "specialists" || tab === "managers");

    const browseScopeKey =
      role === "MANAGER" && tab === "patients"
        ? [tab, role, "org"].join(":")
        : role === "SPECIALIST" && tab === "patients"
          ? [tab, role, "self"].join(":")
          : [tab, role ?? "unknown", activeClinicId ?? "none", scopeVersion].join(
              ":",
            );

    const panelHeaderKey =
      role === "MANAGER" && activeClinicId ? `${tab}:${activeClinicId}` : tab;

    return {
      listFilters,
      browseScopeKey,
      panelHeaderKey,
      isScopeReady,
      scopeBlockedReason,
      refetchOnClinicSwitch,
      createScope,
    };
  }, [tab, role, kind, activeClinicId, scopeVersion]);
}
