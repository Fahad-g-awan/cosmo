"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";

import type { AuditLog } from "@cosmediate/type-utils";

import { ProfileLoader, NoDataFound, Toaster } from "@cosmediate/ui";
import { getAuditLogApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { cn } from "@cosmediate/ui/lib/utils";

import { usePlatformLogsPanelHeader } from "@app/hooks/usePlatformLogsPanelHeader";
import { ProfileInfoSection } from "@app/components/ProfileInfoSection";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";
import { useWorkspace } from "@app/context/WorkspaceContext";

import { buildAuditLogDetailSectionsData } from "../../config/audit-log-detail-sections.config";
import { HeaderSection } from "../../components/detail/HeaderSection";

import { ScrollText } from "lucide-react";

const AuditLogDetails = () => {
  const [log, setLog] = useState<AuditLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams<{ id: string; logId?: string }>();
  const pathname = usePathname();
  const logId = params.logId ?? params.id;
  const { session } = useAuth();
  const { kind } = useWorkspace();

  const fetchAuditLog = useCallback(async () => {
    if (!logId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getAuditLogApi(
        { id: logId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setLog(response.item);
      } else {
        Toaster("Failed to load audit log", "error");
      }
    } catch (error) {
      console.error("Error fetching audit log:", error);
      Toaster("An error occurred while loading audit log", "error");
    } finally {
      setIsLoading(false);
    }
  }, [logId, session?.tokens?.accessToken]);

  const recordHeader = pathname?.includes("/control-panel/audit-logs/for/")
    ? kind === "clinic"
      ? panelHeaderConfig.clinic.controlPanel.auditLogs.record
      : panelHeaderConfig.admin.controlPanel.auditLogs.record
    : pathname?.includes("/control-panel")
      ? kind === "clinic"
        ? panelHeaderConfig.clinic.controlPanel.auditLogs.record
        : panelHeaderConfig.admin.controlPanel.auditLogs.record
      : panelHeaderConfig.admin.auditTrail.record;

  usePlatformLogsPanelHeader(recordHeader);

  useEffect(() => {
    fetchAuditLog();
  }, [fetchAuditLog]);

  if (isLoading && !log) {
    return <ProfileLoader />;
  }

  if (!log && !isLoading) {
    return (
      <NoDataFound
        message="Audit log not found"
        description="Please try again or contact support"
        icon={<ScrollText className="size-7 text-300" strokeWidth={1.5} />}
      />
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-start gap-6">
      {log && (
        <div
          className={cn(
            "w-full flex flex-col items-center justify-start gap-6 overflow-hidden",
            "bg-white rounded-xl sm:border sm:border-gray-200",
          )}
        >
          <HeaderSection log={log} />

          <div className="w-full flex flex-col items-center justify-start gap-6 sm:p-6">
            <div className="w-full grid grid-cols-2 max-sm:grid-cols-1 gap-6">
              {buildAuditLogDetailSectionsData(log).map((section) => (
                <ProfileInfoSection key={section.title} {...section} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogDetails;
