"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Shield } from "lucide-react";

import {
  Button,
  Checkbox,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Spinner,
  Switch,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useFormSetValue, useFormValue } from "@cosmediate/form-core";
import type { UserRole } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import {
  SUPER_ACCESS_GRANT,
  buildPermissionGroups,
  formatResourceGroupLabel,
  grantsFromSelection,
  userCanGrantPermissions,
  FALLBACK_IMPLICIT_GRANTS,
  FALLBACK_ROLE_IMPLICIT_GRANTS,
  getImplicitGrantsForRole,
} from "@app/lib/permissions";
import { usePermissionsCatalog } from "@app/hooks/usePermissionsCatalog";
import { usePermissions } from "@app/hooks/usePermissions";

interface PermissionsGrantFieldProps {
  path?: string;
  targetRole: UserRole;
  className?: string;
  /** When false, selections are shown but not submitted (scaffold mode). */
  persist?: boolean;
}

const MANAGER_GRANTABLE_TARGET_ROLES: UserRole[] = ["MANAGER", "SPECIALIST"];

export const PermissionsGrantField = ({
  path = "perms",
  targetRole,
  className,
  persist = true,
}: PermissionsGrantFieldProps) => {
  const [open, setOpen] = useState(false);

  const selectedPerms = (useFormValue(path) as string[] | undefined) ?? [];
  const { implicitGrants, roleImplicitGrants } = usePermissions();
  const setValue = useFormSetValue();
  const { sessionUser } = useAuth();

  const canGrant = useMemo(
    () => userCanGrantPermissions(sessionUser?.perms ?? []),
    [sessionUser?.perms],
  );

  const isTargetGrantable = useMemo(() => {
    if (!canGrant) return false;
    if (sessionUser?.role === "SPECIALIST") return false;
    if (sessionUser?.role === "MANAGER" && targetRole === "PATIENT") {
      return false;
    }
    if (targetRole === "PATIENT") return true;
    if (targetRole === "ADMIN") return true;
    return MANAGER_GRANTABLE_TARGET_ROLES.includes(targetRole);
  }, [canGrant, sessionUser?.role, targetRole]);

  const effectiveImplicitGrants = useMemo(
    () =>
      getImplicitGrantsForRole(
        targetRole,
        implicitGrants.length ? implicitGrants : FALLBACK_IMPLICIT_GRANTS,
        Object.keys(roleImplicitGrants).length
          ? roleImplicitGrants
          : FALLBACK_ROLE_IMPLICIT_GRANTS,
      ),
    [targetRole, implicitGrants, roleImplicitGrants],
  );

  const { catalog, isLoading, error } = usePermissionsCatalog({
    targetRole,
    enabled: isTargetGrantable,
  });

  const permissionGroups = useMemo(
    () =>
      catalog
        ? buildPermissionGroups(
            catalog.groups,
            formatResourceGroupLabel,
            effectiveImplicitGrants,
          )
        : [],
    [catalog, effectiveImplicitGrants],
  );

  const delegatableGrants = catalog?.grants ?? [];
  const hasSuperAccess = selectedPerms.includes(SUPER_ACCESS_GRANT);
  const regularSelection = selectedPerms.filter(
    (grant) => grant !== SUPER_ACCESS_GRANT,
  );

  const allGrantValues = useMemo(
    () =>
      permissionGroups.flatMap((group) =>
        group.grants.map((grant) => grant.value),
      ),
    [permissionGroups],
  );

  const allGrantsSelected =
    allGrantValues.length > 0 &&
    allGrantValues.every((grant) => regularSelection.includes(grant));
  const someGrantsSelected =
    allGrantValues.some((grant) => regularSelection.includes(grant)) &&
    !allGrantsSelected;

  const showSelectAll = targetRole !== "ADMIN" && allGrantValues.length > 0;

  const updateSelection = (next: string[]) => {
    setValue(
      path,
      grantsFromSelection(
        next,
        delegatableGrants,
        effectiveImplicitGrants,
      ),
    );
  };

  const toggleGrant = (grant: string, checked: boolean) => {
    if (hasSuperAccess) return;
    const next = checked
      ? [...regularSelection, grant]
      : regularSelection.filter((item) => item !== grant);
    updateSelection(next);
  };

  const toggleGroup = (grants: string[], checked: boolean) => {
    if (hasSuperAccess) return;
    const grantSet = new Set(regularSelection);
    grants.forEach((grant) => {
      if (checked) grantSet.add(grant);
      else grantSet.delete(grant);
    });
    updateSelection([...grantSet]);
  };

  const toggleSuperAccess = (enabled: boolean) => {
    if (!catalog?.superAccess.canGrant) return;
    setValue(path, enabled ? [SUPER_ACCESS_GRANT] : []);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (hasSuperAccess) return;
    updateSelection(checked ? allGrantValues : []);
  };

  if (!isTargetGrantable) {
    return null;
  }

  const selectedCount = hasSuperAccess ? 1 : regularSelection.length;
  const triggerLabel =
    selectedCount > 0
      ? `${selectedCount} permission${selectedCount === 1 ? "" : "s"} selected`
      : "Configure permissions";

  const renderGroup = (group: (typeof permissionGroups)[number]) => {
    const grantValues = group.grants.map((grant) => grant.value);
    const selectedInGroup = grantValues.filter((grant) =>
      regularSelection.includes(grant),
    );
    const allSelected =
      grantValues.length > 0 && selectedInGroup.length === grantValues.length;
    const someSelected =
      selectedInGroup.length > 0 && selectedInGroup.length < grantValues.length;

    return (
      <div
        key={group.groupKey}
        className="rounded-lg border border-200 bg-50/40"
      >
        <div className="flex items-center gap-3 px-3 py-2.5 border-b border-200/80">
          <Checkbox
            id={`${group.groupKey}-all`}
            checked={
              allSelected ? true : someSelected ? "indeterminate" : false
            }
            disabled={hasSuperAccess}
            onCheckedChange={(checked) =>
              toggleGroup(grantValues, checked === true)
            }
          />
          <Label
            htmlFor={`${group.groupKey}-all`}
            className="text-sm font-medium text-700 cursor-pointer"
          >
            {group.groupLabel}
          </Label>
          <span className="ml-auto text-xs text-400">
            {selectedInGroup.length}/{grantValues.length}
          </span>
        </div>

        <div className="grid gap-1 p-2">
          {group.grants.map((grant) => (
            <label
              key={grant.id}
              htmlFor={grant.id}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-white/80 cursor-pointer"
            >
              <Checkbox
                id={grant.id}
                checked={regularSelection.includes(grant.value)}
                disabled={hasSuperAccess}
                onCheckedChange={(checked) =>
                  toggleGrant(grant.value, checked === true)
                }
              />
              <span className="text-xs text-600">{grant.label}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Label className="text-sm font-medium text-700">Permissions</Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between h-10 font-normal text-xs"
            disabled={isLoading}
          >
            <span className="flex items-center gap-2 truncate">
              <Shield className="size-4 text-400 shrink-0" />
              <span className="truncate">{triggerLabel}</span>
            </span>
            {isLoading ? (
              <Spinner className="size-4" />
            ) : (
              <ChevronDown className="size-4 text-400 shrink-0" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-[min(92vw,420px)] p-0 overflow-hidden pb-2"
          sideOffset={6}
        >
          {error ? (
            <p className="p-4 text-sm text-destructive">{error}</p>
          ) : (
            <>
              {catalog?.superAccess.canGrant && (
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-200">
                  <div>
                    <p className="text-sm font-medium text-700">Super access</p>
                    <p className="text-xs text-400">
                      Grants all permissions (`*:*`)
                    </p>
                  </div>
                  <Switch
                    checked={hasSuperAccess}
                    onCheckedChange={toggleSuperAccess}
                  />
                </div>
              )}

              <ScrollArea className="h-[min(60dvh,420px)]">
                <div
                  className={cn(
                    "space-y-2 p-4",
                    hasSuperAccess && "opacity-50 pointer-events-none",
                  )}
                >
                  {showSelectAll && (
                    <div className="flex items-center gap-3 rounded-lg border border-200 bg-white px-3 py-2.5">
                      <Checkbox
                        id={`${path}-select-all`}
                        checked={
                          allGrantsSelected
                            ? true
                            : someGrantsSelected
                              ? "indeterminate"
                              : false
                        }
                        disabled={hasSuperAccess}
                        onCheckedChange={(checked) =>
                          toggleSelectAll(checked === true)
                        }
                      />
                      <Label
                        htmlFor={`${path}-select-all`}
                        className="text-sm font-medium text-700 cursor-pointer"
                      >
                        Select all permissions
                      </Label>
                      <span className="ml-auto text-xs text-400">
                        {regularSelection.filter((grant) =>
                          allGrantValues.includes(grant),
                        ).length}
                        /{allGrantValues.length}
                      </span>
                    </div>
                  )}

                  {permissionGroups.map((group) => renderGroup(group))}

                  {permissionGroups.length === 0 && (
                    <p className="text-sm text-400 py-6 text-center">
                      No delegatable permissions available.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </PopoverContent>
      </Popover>

      <p className="text-xs text-400">
        {persist
          ? "Optional. Leave empty to use role defaults."
          : "Preview only — permission changes for management roles are not saved yet."}
      </p>
    </div>
  );
};
