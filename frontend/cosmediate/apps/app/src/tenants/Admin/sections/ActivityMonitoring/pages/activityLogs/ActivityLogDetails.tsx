"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";

import type { ActivityLog } from "@cosmediate/type-utils";

import { ProfileLoader, NoDataFound, Toaster } from "@cosmediate/ui";
import { getActivityLogApi } from "@cosmediate/api";
import { useAuth } from "@cosmediate/auth";
import { cn } from "@cosmediate/ui/lib/utils";

import { usePlatformLogsPanelHeader } from "@app/hooks/usePlatformLogsPanelHeader";
import { ProfileInfoSection } from "@app/components/ProfileInfoSection";
import { panelHeaderConfig } from "@app/config/panelHeader.config.";

import { buildActivityLogDetailSectionsData } from "../../config/activity-log-detail-sections.config";
import { HeaderSection } from "../../components/detail/HeaderSection";

import { Activity } from "lucide-react";

const ActivityLogDetails = () => {
  const [log, setLog] = useState<ActivityLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams<{ id: string }>();
  const logId = params.id;
  const { session } = useAuth();

  const fetchActivityLog = useCallback(async () => {
    if (!logId || !session?.tokens?.accessToken) {
      Toaster("Unauthorized Access", "error");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getActivityLogApi(
        { id: logId },
        session.tokens.accessToken,
      );

      if (response.success && response.item) {
        setLog(response.item);
      } else {
        Toaster("Failed to load activity log", "error");
      }
    } catch (error) {
      console.error("Error fetching activity log:", error);
      Toaster("An error occurred while loading activity log", "error");
    } finally {
      setIsLoading(false);
    }
  }, [logId, session?.tokens?.accessToken]);

  usePlatformLogsPanelHeader(panelHeaderConfig.admin.activityMonitoring.record);

  useEffect(() => {
    fetchActivityLog();
  }, [fetchActivityLog]);

  if (isLoading && !log) {
    return <ProfileLoader />;
  }

  if (!log && !isLoading) {
    return (
      <NoDataFound
        message="Activity log not found"
        description="Please try again or contact support"
        icon={<Activity className="size-7 text-300" strokeWidth={1.5} />}
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
              {buildActivityLogDetailSectionsData(log).map((section) => (
                <ProfileInfoSection key={section.title} {...section} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogDetails;
