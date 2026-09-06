import { DateTime } from "luxon";

import type { AuditLog } from "@cosmediate/type-utils";

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
import { ScrollText } from "lucide-react";

const formatLogDataValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
};

export const buildAuditLogDetailSectionsData = (
  log: AuditLog,
): ProfileInfoSectionConfig[] => {
  const logDataEntries = Object.entries(log.logData ?? {});

  return [
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
      title: "Event",
      fields: [
        {
          icon: Shield,
          label: "Action",
          value: formatLogActionLabel(log.action),
        },
        {
          icon: ScrollText,
          label: "Entity",
          value: formatLogEntityLabel(log.entity),
        },
        {
          icon: Calendar,
          label: "Created at",
          value: log.createdAt
            ? DateTime.fromISO(log.createdAt).toFormat("dd MMM yyyy, HH:mm")
            : "N/A",
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
            title: "Change data",
            fields: logDataEntries.map(([key, value]) => ({
              label: key,
              value: formatLogDataValue(value),
            })),
          },
        ]
      : []),
  ];
};
