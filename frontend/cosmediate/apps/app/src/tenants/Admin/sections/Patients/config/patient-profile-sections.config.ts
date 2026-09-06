import { DateTime } from "luxon";

import type { Patient } from "@cosmediate/type-utils/auth";

import {
  FiMail as Mail,
  FiPhone as Phone,
  FiUser as UserIcon,
  FiMapPin as MapPin,
  FiCalendar as Calendar,
  FiShield as Shield,
} from "react-icons/fi";

import type { ProfileInfoSectionConfig } from "@app/components/ProfileInfoSection";
import { formatPermsSummary } from "@app/components/permissions/formatPermsSummary";
import { formatCreationSourceLabel } from "@app/lib/filters";

export const buildPatientProfileSectionsData = (
  entity: Patient,
): ProfileInfoSectionConfig[] => [
  {
    title: "Contact Information",
    fields: [
      {
        icon: Mail,
        label: "Email",
        value: entity.email || "N/A",
      },
      {
        icon: Phone,
        label: "Phone",
        value: entity.phone || "N/A",
      },
      ...(entity.age
        ? [
            {
              icon: UserIcon,
              label: "Age",
              value: String(entity.age),
            },
          ]
        : []),
    ],
  },
  {
    title: "Location",
    fields: [
      {
        icon: MapPin,
        label: "Address",
        value:
          [entity.city, entity.state, entity.country]
            .filter(Boolean)
            .join(", ") || "N/A",
      },
      ...(entity.postalCode
        ? [
            {
              icon: MapPin,
              label: "Postal Code",
              value: entity.postalCode,
            },
          ]
        : []),
    ],
  },
  {
    title: "Account Information",
    fields: [
      {
        icon: UserIcon,
        label: "Creation source",
        value: formatCreationSourceLabel(entity.creationSource),
      },
      {
        icon: Calendar,
        label: "Created At",
        value: entity.createdAt
          ? DateTime.fromISO(entity.createdAt).toFormat("dd MMM yyyy, HH:mm")
          : "N/A",
      },
      {
        icon: Calendar,
        label: "Last Updated",
        value: entity.updatedAt
          ? DateTime.fromISO(entity.updatedAt).toFormat("dd MMM yyyy, HH:mm")
          : "N/A",
      },
    ],
  },
  {
    title: "Permissions",
    fields: [
      {
        icon: Shield,
        label: "Access",
        value: formatPermsSummary(entity.perms),
      },
    ],
  },
  {
    title: "Security",
    fields: [
      {
        icon: Shield,
        label: "Password Set",
        value: entity.passwordSet ? "Yes" : "No",
      },
      {
        icon: Shield,
        label: "Linked Providers",
        value:
          entity.linkedProviders && entity.linkedProviders.length > 0
            ? entity.linkedProviders.join(", ")
            : "None",
      },
    ],
  },
];
