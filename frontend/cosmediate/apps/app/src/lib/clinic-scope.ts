import type { Clinic } from "@cosmediate/type-utils/clinic";
import type { UserRole, WorkingType } from "@cosmediate/type-utils";

import type {
  ActiveClinicSummary,
  WorkspaceKind,
  WorkspaceState,
} from "@app/context/WorkspaceContext";

export function formatClinicAddressLine(
  city?: string | null,
  completeAddress?: string | null,
): string {
  const parts = [city, completeAddress].filter(Boolean);
  if (parts.length === 2) return `${parts[0]} · ${parts[1]}`;
  return parts.join(" ");
}

export function clinicToActiveSummary(clinic: Pick<
  Clinic,
  "id" | "name" | "logo" | "city" | "completeAddress"
>): ActiveClinicSummary {
  return {
    id: clinic.id,
    name: clinic.name,
    logo: clinic.logo ?? null,
    city: clinic.city ?? null,
    completeAddress: clinic.completeAddress ?? null,
  };
}

/**
 * Manager workspace bootstrap: active clinic must be one the manager is linked to
 * (`clinicIds`). `parentClinicId` is the org root and may not appear in that list
 * for branch-only managers.
 */
export function resolveInitialActiveClinicId(
  parentClinicId: string | null | undefined,
  clinicIds: string[] | undefined,
): string | null {
  const ids = (clinicIds ?? []).filter(Boolean);
  if (!ids.length) return parentClinicId ?? null;

  if (parentClinicId && ids.includes(parentClinicId)) {
    return parentClinicId;
  }

  return ids[0] ?? null;
}

/**
 * Specialist workspace bootstrap: full-time uses home clinic only; freelance
 * picks the first linked clinic (user may switch later).
 */
export function resolveSpecialistInitialActiveClinicId(
  workingType: WorkingType | undefined,
  parentClinicId: string | null | undefined,
  clinicIds: string[] | undefined,
): string | null {
  if (workingType === "FULL_TIME") {
    return parentClinicId ?? resolveInitialActiveClinicId(null, clinicIds);
  }

  return resolveInitialActiveClinicId(parentClinicId, clinicIds);
}

function preserveActiveClinicSelection(
  bootstrapped: WorkspaceState,
  current: WorkspaceState,
  allowedIds: Set<string>,
): WorkspaceState {
  const currentId = current.activeClinicId;
  if (!currentId || !allowedIds.has(currentId)) {
    return bootstrapped;
  }

  return {
    ...bootstrapped,
    activeClinicId: currentId,
    activeClinicSummary:
      current.activeClinicSummary?.id === currentId
        ? current.activeClinicSummary
        : null,
    scopeVersion: current.scopeVersion,
  };
}

/**
 * Reconcile workspace after session hydration without discarding a valid
 * clinic selection (e.g. silent auth /me refresh).
 */
export function mergeWorkspaceFromSession(
  current: WorkspaceState,
  bootstrapped: WorkspaceState,
  clinicIds: string[] | undefined,
  parentClinicId: string | null | undefined,
  identityChanged: boolean,
  workingType?: WorkingType,
): WorkspaceState {
  if (identityChanged || current.kind !== bootstrapped.kind) {
    return bootstrapped;
  }

  if (bootstrapped.kind === "clinic") {
    const allowedIds = new Set((clinicIds ?? []).filter(Boolean));
    if (parentClinicId) {
      allowedIds.add(parentClinicId);
    }

    return preserveActiveClinicSelection(bootstrapped, current, allowedIds);
  }

  if (bootstrapped.kind === "specialist") {
    if (workingType === "FULL_TIME") {
      const expectedId = bootstrapped.activeClinicId;
      if (current.activeClinicId === expectedId) {
        return {
          ...bootstrapped,
          activeClinicSummary:
            current.activeClinicSummary?.id === expectedId
              ? current.activeClinicSummary
              : null,
          scopeVersion: current.scopeVersion,
        };
      }

      return bootstrapped;
    }

    return preserveActiveClinicSelection(
      bootstrapped,
      current,
      new Set((clinicIds ?? []).filter(Boolean)),
    );
  }

  return bootstrapped;
}

export function shouldShowClinicSwitcher(
  userRole: UserRole | null | undefined,
  kind: WorkspaceKind,
  workingType?: WorkingType,
): boolean {
  if (userRole === "MANAGER" && kind === "clinic") return true;
  return (
    userRole === "SPECIALIST" &&
    kind === "specialist" &&
    workingType === "FREELANCE"
  );
}

export function shouldShowClinicScopeInHeader(
  userRole: UserRole | null | undefined,
  kind: WorkspaceKind,
): boolean {
  return (
    (userRole === "MANAGER" && kind === "clinic") ||
    (userRole === "SPECIALIST" && kind === "specialist")
  );
}
