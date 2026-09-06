"use client";

import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
  useRef,
} from "react";

import type { UserRole, WorkingType } from "@cosmediate/type-utils";
import { getManagementClinicApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";

import {
  clinicToActiveSummary,
  mergeWorkspaceFromSession,
  resolveInitialActiveClinicId,
  resolveSpecialistInitialActiveClinicId,
} from "@app/lib/clinic-scope";

export type WorkspaceKind = "platform" | "clinic" | "specialist" | "patient";

export interface ActiveClinicSummary {
  id: string;
  name: string;
  logo?: string | null;
  city?: string | null;
  completeAddress?: string | null;
}

export interface WorkspaceState {
  kind: WorkspaceKind;
  activeClinicId: string | null;
  activeSpecialistId: string | null;
  activeClinicSummary: ActiveClinicSummary | null;
  scopeVersion: number;
}

interface WorkspaceContextState {
  workspace: WorkspaceState;
}

interface SyncWorkspacePayload {
  bootstrapped: WorkspaceState;
  clinicIds?: string[];
  parentClinicId?: string | null;
  workingType?: WorkingType;
  identityChanged: boolean;
}

interface WorkspaceContextAction {
  type: string;
  payload?:
    | WorkspaceState
    | ActiveClinicSummary
    | string
    | null
    | SyncWorkspacePayload;
}

export interface WorkspaceContextType {
  workspace: WorkspaceState;
  kind: WorkspaceKind;
  activeClinicId: string | null;
  activeSpecialistId: string | null;
  activeClinicSummary: ActiveClinicSummary | null;
  scopeVersion: number;
  setActiveClinicId: (clinicId: string | null) => void;
  setActiveClinicSummary: (summary: ActiveClinicSummary | null) => void;
  selectActiveClinic: (summary: ActiveClinicSummary) => void;
}

const initialWorkspace: WorkspaceState = {
  kind: "platform",
  activeClinicId: null,
  activeSpecialistId: null,
  activeClinicSummary: null,
  scopeVersion: 0,
};

const initialState: WorkspaceContextState = {
  workspace: initialWorkspace,
};

export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

function workspaceKindForRole(role: UserRole | null): WorkspaceKind {
  if (role === "MANAGER") return "clinic";
  if (role === "SPECIALIST") return "specialist";
  if (role === "PATIENT") return "patient";
  return "platform";
}

function bootstrapWorkspace(
  role: UserRole | null,
  profileId: string | null,
  parentClinicId?: string | null,
  clinicIds?: string[],
  workingType?: WorkingType,
): WorkspaceState {
  const kind = workspaceKindForRole(role);

  if (kind === "clinic") {
    return {
      kind,
      activeClinicId: resolveInitialActiveClinicId(parentClinicId, clinicIds),
      activeSpecialistId: null,
      activeClinicSummary: null,
      scopeVersion: 0,
    };
  }

  if (kind === "specialist") {
    return {
      kind,
      activeClinicId: resolveSpecialistInitialActiveClinicId(
        workingType,
        parentClinicId,
        clinicIds,
      ),
      activeSpecialistId: profileId,
      activeClinicSummary: null,
      scopeVersion: 0,
    };
  }

  return {
    kind,
    activeClinicId: null,
    activeSpecialistId: null,
    activeClinicSummary: null,
    scopeVersion: 0,
  };
}

const reducer = (
  state: WorkspaceContextState,
  action: WorkspaceContextAction,
): WorkspaceContextState => {
  switch (action.type) {
    case "SET_WORKSPACE":
      return { ...state, workspace: action.payload as WorkspaceState };
    case "SYNC_WORKSPACE_FROM_SESSION": {
      const {
        bootstrapped,
        clinicIds,
        parentClinicId,
        workingType,
        identityChanged,
      } = action.payload as SyncWorkspacePayload;

      return {
        ...state,
        workspace: mergeWorkspaceFromSession(
          state.workspace,
          bootstrapped,
          clinicIds,
          parentClinicId,
          identityChanged,
          workingType,
        ),
      };
    }
    case "SET_ACTIVE_CLINIC_ID":
      return {
        ...state,
        workspace: {
          ...state.workspace,
          activeClinicId: action.payload as string | null,
        },
      };
    case "SELECT_ACTIVE_CLINIC":
      return {
        ...state,
        workspace: {
          ...state.workspace,
          activeClinicId: (action.payload as ActiveClinicSummary).id,
          activeClinicSummary: action.payload as ActiveClinicSummary,
          scopeVersion: state.workspace.scopeVersion + 1,
        },
      };
    case "SET_ACTIVE_CLINIC_SUMMARY":
      return {
        ...state,
        workspace: {
          ...state.workspace,
          activeClinicSummary: action.payload as ActiveClinicSummary | null,
        },
      };
    default:
      return state;
  }
};

const WorkspaceProviderComp = (): WorkspaceContextType => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { sessionUser, userRole, profileId, isAuthenticated, session } =
    useAuth();
  const lastIdentityKeyRef = useRef<string | null>(null);

  const resolvedProfileId = sessionUser?.profileId ?? profileId ?? null;
  const parentClinicId = sessionUser?.scope?.parentClinicId ?? null;
  const clinicIds = sessionUser?.scope?.clinicIds;
  const workingType = sessionUser?.scope?.workingType;
  const clinicIdsKey = (clinicIds ?? []).slice().sort().join(",");

  useEffect(() => {
    if (!isAuthenticated || !userRole) return;

    const identityKey = `${userRole}:${resolvedProfileId ?? ""}`;
    const identityChanged = lastIdentityKeyRef.current !== identityKey;
    lastIdentityKeyRef.current = identityKey;

    dispatch({
      type: "SYNC_WORKSPACE_FROM_SESSION",
      payload: {
        bootstrapped: bootstrapWorkspace(
          userRole,
          resolvedProfileId,
          parentClinicId,
          clinicIds,
          workingType,
        ),
        clinicIds,
        parentClinicId,
        workingType,
        identityChanged,
      },
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    userRole,
    resolvedProfileId,
    parentClinicId,
    clinicIdsKey,
    workingType,
  ]);

  useEffect(() => {
    const loadsClinicSummary =
      userRole === "MANAGER" || userRole === "SPECIALIST";
    if (!isAuthenticated || !loadsClinicSummary) return;

    const clinicId = state.workspace.activeClinicId;
    if (!clinicId) return;
    if (state.workspace.activeClinicSummary?.id === clinicId) return;

    const accessToken = session?.tokens?.accessToken;
    if (!accessToken) return;

    let cancelled = false;

    void (async () => {
      try {
        const response = await getManagementClinicApi(
          { id: clinicId, from: "listing" },
          accessToken,
        );

        if (cancelled || !response.item) return;

        dispatch({
          type: "SET_ACTIVE_CLINIC_SUMMARY",
          payload: clinicToActiveSummary(response.item),
        });
      } catch (error) {
        console.error(
          "[WorkspaceContext] Failed to load active clinic summary:",
          error,
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    userRole,
    session?.tokens?.accessToken,
    state.workspace.activeClinicId,
    state.workspace.activeClinicSummary?.id,
  ]);

  const setActiveClinicId = (clinicId: string | null) => {
    dispatch({ type: "SET_ACTIVE_CLINIC_ID", payload: clinicId });
  };

  const setActiveClinicSummary = (summary: ActiveClinicSummary | null) => {
    dispatch({ type: "SET_ACTIVE_CLINIC_SUMMARY", payload: summary });
  };

  const selectActiveClinic = (summary: ActiveClinicSummary) => {
    dispatch({ type: "SELECT_ACTIVE_CLINIC", payload: summary });
  };

  const { workspace } = state;

  return {
    workspace,
    kind: workspace.kind,
    activeClinicId: workspace.activeClinicId,
    activeSpecialistId: workspace.activeSpecialistId,
    activeClinicSummary: workspace.activeClinicSummary,
    scopeVersion: workspace.scopeVersion,
    setActiveClinicId,
    setActiveClinicSummary,
    selectActiveClinic,
  };
};

const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const contextValue = WorkspaceProviderComp();

  return (
    <WorkspaceContext.Provider value={contextValue}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);

  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }

  return context;
};

export default WorkspaceProvider;
