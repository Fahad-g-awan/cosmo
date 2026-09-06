"use client";

import React, { useCallback, useEffect, useState } from "react";

import {
  Button,
  ButtonLoader,
  Label,
  Switch,
  Textarea,
  Toaster,
} from "@cosmediate/ui";
import {
  getSystemSettingsApi,
  updateSystemSettingsApi,
} from "@cosmediate/api";
import type { SystemSettings } from "@cosmediate/type-utils";
import { useAuth } from "@cosmediate/auth";

import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { usePanelHeader } from "@app/layout/management/context";
import { canCrud } from "@app/lib/permissions";
import { usePermissions } from "@app/hooks/usePermissions";
import {
  handleCrudMutationResult,
  showApiFailureToast,
} from "@app/lib/api-errors";

const MaintenanceSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [maintenanceAllowAdminAccess, setMaintenanceAllowAdminAccess] =
    useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { session } = useAuth();
  const { perms } = usePermissions();
  const { setPanelHeaderConfig } = usePanelHeader();
  const canUpdate = canCrud(perms, "system_setting", "update");

  const loadSettings = useCallback(async () => {
    if (!session?.tokens?.accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getSystemSettingsApi(session.tokens.accessToken);

      if (response.success && response.item) {
        setSettings(response.item);
        setMaintenanceMode(response.item.maintenanceMode);
        setMaintenanceMessage(response.item.maintenanceMessage ?? "");
        setMaintenanceAllowAdminAccess(
          response.item.maintenanceAllowAdminAccess,
        );
      } else {
        showApiFailureToast(response, "Failed to load maintenance settings");
      }
    } catch (error) {
      console.error("Error loading maintenance settings:", error);
      Toaster("Failed to load maintenance settings", "error");
    } finally {
      setIsLoading(false);
    }
  }, [session?.tokens?.accessToken]);

  useEffect(() => {
    setPanelHeaderConfig(
      panelHeaderConfig.admin.settings.platform.maintenance,
    );
  }, [setPanelHeaderConfig]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session?.tokens?.accessToken || !canUpdate) return;

    try {
      setIsSubmitting(true);
      const response = await updateSystemSettingsApi(
        {
          maintenanceMode,
          maintenanceMessage: maintenanceMessage.trim() || null,
          maintenanceAllowAdminAccess,
        },
        session.tokens.accessToken,
      );

      handleCrudMutationResult(response, {
        successMessage: "Maintenance settings saved",
        errorTitle: "Failed to save maintenance settings",
        onSuccess: () => {
          if (response.success && "item" in response && response.item) {
            setSettings(response.item);
          }
        },
      });
    } catch (error) {
      console.error("Error saving maintenance settings:", error);
      showApiFailureToast(
        {
          success: false,
          message: error instanceof Error ? error.message : undefined,
        },
        "Failed to save maintenance settings",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-400">Loading maintenance settings...</div>;
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-700 max-sm:text-lg">
          Maintenance mode
        </h1>
        <p className="text-sm text-400">
          Control platform-wide maintenance banners and API availability for
          non-admin users.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-200 bg-white p-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="maintenanceMode">Maintenance mode</Label>
            <p className="text-xs text-400">
              When enabled, non-admin API traffic is blocked with a 503 response.
            </p>
          </div>
          <Switch
            id="maintenanceMode"
            checked={maintenanceMode}
            onCheckedChange={setMaintenanceMode}
            disabled={!canUpdate}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maintenanceMessage">Maintenance message</Label>
          <Textarea
            id="maintenanceMessage"
            value={maintenanceMessage}
            onChange={(event) => setMaintenanceMessage(event.target.value)}
            placeholder="The platform is temporarily unavailable for maintenance."
            rows={4}
            disabled={!canUpdate}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <Label htmlFor="maintenanceAllowAdminAccess">
              Allow admin access during maintenance
            </Label>
            <p className="text-xs text-400">
              Admins can continue using the platform while maintenance mode is on.
            </p>
          </div>
          <Switch
            id="maintenanceAllowAdminAccess"
            checked={maintenanceAllowAdminAccess}
            onCheckedChange={setMaintenanceAllowAdminAccess}
            disabled={!canUpdate}
          />
        </div>

        {settings?.updatedAt ? (
          <p className="text-xs text-400">
            Last updated: {new Date(settings.updatedAt).toLocaleString()}
          </p>
        ) : null}

        {canUpdate ? (
          <div className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={isSubmitting} className="min-w-[180px]">
              {isSubmitting ? <ButtonLoader /> : "Save settings"}
            </Button>
          </div>
        ) : null}
      </form>
    </div>
  );
};

export default MaintenanceSettings;
