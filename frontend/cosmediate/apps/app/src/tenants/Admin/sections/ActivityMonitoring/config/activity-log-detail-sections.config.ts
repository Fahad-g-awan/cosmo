import { DateTime } from "luxon";

import type { ActivityLog } from "@cosmediate/type-utils";

import type { ProfileInfoSectionConfig } from "@app/components/ProfileInfoSection";
import {
  formatLogActionLabel,
  formatLogEntityLabel,
} from "@app/lib/platform-logs";

import {
  FiCalendar as Calendar,
  FiShield as Shield,
  FiUser as User,
  FiMail as Mail,
  FiMapPin as MapPin,
} from "react-icons/fi";
import { Activity, Radio } from "lucide-react";

const formatLogDataValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

export const buildActivityLogDetailSectionsData = (
  log: ActivityLog,
): ProfileInfoSectionConfig[] => {
  const logDataEntries = Object.entries(log.logData ?? {});

  return [
    {
      title: "Activity",
      fields: [
        {
          icon: Activity,
          label: "Feed line",
          value: log.feedLine || "N/A",
        },
        {
          icon: Shield,
          label: "Action",
          value: formatLogActionLabel(log.action),
        },
        {
          icon: Radio,
          label: "Scope",
          value: formatLogEntityLabel(log.scope),
        },
        {
          icon: Calendar,
          label: "Occurred at",
          value: log.occurredAt
            ? DateTime.fromISO(log.occurredAt).toFormat("dd MMM yyyy, HH:mm")
            : "N/A",
        },
      ],
    },
    {
      title: "Actor",
      fields: [
        {
          icon: User,
          label: "Display name",
          value: log.actorDisplayName || "N/A",
        },
        {
          icon: Mail,
          label: "Email",
          value: log.actorEmail || "N/A",
        },
        {
          icon: Shield,
          label: "Role",
          value: log.actorRole || "N/A",
        },
        {
          icon: User,
          label: "Actor ID",
          value: log.actorId || "N/A",
        },
      ],
    },
    {
      title: "Target",
      fields: [
        {
          icon: Radio,
          label: "Target name",
          value: log.targetName || "N/A",
        },
        {
          icon: User,
          label: "Target entity ID",
          value: log.targetEntityId || "N/A",
        },
        {
          icon: MapPin,
          label: "Clinic ID",
          value: log.clinicId || "N/A",
        },
      ],
    },
    ...(logDataEntries.length
      ? [
          {
            title: "Additional data",
            fields: logDataEntries.map(([key, value]) => ({
              label: key,
              value: formatLogDataValue(value),
            })),
          },
        ]
      : []),
  ];
};
