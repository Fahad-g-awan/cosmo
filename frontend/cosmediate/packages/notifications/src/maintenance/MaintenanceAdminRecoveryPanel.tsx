"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  getSystemSettingsApi,
  reportMaintenanceBlocked,
  setMaintenanceBypass,
  updateSystemSettingsApi,
  MAINTENANCE_ADMIN_SETTINGS_PATH,
} from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { Button, ButtonLoader, Label, Switch, Toaster } from "@cosmediate/ui";

export const MaintenanceAdminRecoveryPanel = () => {
  const { session } = useAuth();
  const accessToken = session?.tokens?.accessToken;

  const [maintenanceMode, setMaintenanceMode] = useState(true);
  const [maintenanceAllowAdminAccess, setMaintenanceAllowAdminAccess] =
    useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!accessToken) {
      setIsLoading(false);
      setCanUpdate(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getSystemSettingsApi(accessToken);

      if (response.success && response.item) {
        setMaintenanceMode(response.item.maintenanceMode);
        setMaintenanceAllowAdminAccess(
          response.item.maintenanceAllowAdminAccess,
        );
        setCanUpdate(true);
      } else {
        setCanUpdate(false);
      }
    } catch {
      setCanUpdate(false);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    if (!accessToken || !canUpdate) return;

    try {
      setIsSaving(true);
      const response = await updateSystemSettingsApi(
        {
          maintenanceMode,
          maintenanceAllowAdminAccess,
        },
        accessToken,
      );

      if (!response.success) {
        Toaster(
          response.message ?? "Failed to update maintenance settings",
          "error",
        );
        return;
      }

      Toaster("Maintenance settings saved", "success");

      if (!maintenanceMode) {
        reportMaintenanceBlocked(null);
        return;
      }

      if (maintenanceAllowAdminAccess) {
        setMaintenanceBypass(true);
        reportMaintenanceBlocked(null);
      }
    } catch {
      Toaster("Failed to update maintenance settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        Loading maintenance controls…
      </p>
    );
  }

  if (!canUpdate) {
    return (
      <p className="mt-6 text-sm text-muted-foreground">
        You need system settings permissions to change maintenance mode.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-4 border-t border-border pt-6 text-left">
      <p className="text-sm font-medium text-foreground">Admin recovery</p>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="recovery-maintenanceMode">Maintenance mode</Label>
          <p className="text-xs text-muted-foreground">
            Turn off to restore platform access.
          </p>
        </div>
        <Switch
          id="recovery-maintenanceMode"
          checked={maintenanceMode}
          onCheckedChange={setMaintenanceMode}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <Label htmlFor="recovery-allowAdminAccess">
            Allow admin access during maintenance
          </Label>
          <p className="text-xs text-muted-foreground">
            Admins can use the platform while maintenance is on.
          </p>
        </div>
        <Switch
          id="recovery-allowAdminAccess"
          checked={maintenanceAllowAdminAccess}
          onCheckedChange={setMaintenanceAllowAdminAccess}
        />
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
        <Button
          type="button"
          className="min-w-[160px]"
          disabled={isSaving}
          onClick={() => void handleSave()}
        >
          {isSaving ? <ButtonLoader /> : "Save changes"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href={MAINTENANCE_ADMIN_SETTINGS_PATH}>
            Open maintenance settings
          </Link>
        </Button>
      </div>
    </div>
  );
};
