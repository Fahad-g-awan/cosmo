import { Lead } from "@cosmediate/type-utils";
import { DateTime } from "luxon";

import {
  FiMail as Mail,
  FiPhone as Phone,
  FiUser as UserIcon,
  FiMapPin as MapPin,
  FiTag as Tag,
  FiGlobe as Globe,
  FiFileText as FileText,
  FiCalendar as Calendar,
  FiMessageSquare as MessageSquare,
} from "react-icons/fi";

import type { ProfileInfoSectionConfig } from "@app/components/ProfileInfoSection";

export const buildLeadsInfoSectionsData = (
  lead: Lead
): ProfileInfoSectionConfig[] => [
  {
    title: "Contact Information",
    fields: [
      {
        valueClassName: "capitalize",
        icon: UserIcon,
        label: "Full Name",
        value: lead.fullName || "N/A",
      },
      {
        icon: Mail,
        label: "Email",
        value: lead.email || "N/A",
      },
      {
        icon: Phone,
        label: "Phone",
        value: lead.phone || "N/A",
      },
    ],
  },
  {
    title: "Location",
    fields: [
      {
        icon: MapPin,
        label: "Address",
        value:
          [lead.city, lead.state, lead.country].filter(Boolean).join(", ") ||
          "N/A",
      },
      ...(lead.postalCode
        ? [
            {
              icon: MapPin,
              label: "Postal Code",
              value: lead.postalCode,
            },
          ]
        : []),
    ],
  },
  {
    title: "Lead Information",
    fields: [
      {
        icon: Tag,
        label: "Type",
        value: lead?.type || "N/A",
      },
      {
        icon: Globe,
        label: "Source",
        value: lead?.source || "N/A",
      },
      {
        icon: FileText,
        label: "Company",
        value: lead?.companyName || "N/A",
      },
      {
        icon: FileText,
        label: "Registration Number",
        value: lead?.registrationNumber || "N/A",
      },
    ],
  },
  {
    title: "Activity",
    fields: [
      {
        icon: Calendar,
        label: "Created At",
        value: lead.createdAt
          ? DateTime.fromISO(lead.createdAt).toFormat("dd MMM yyyy, HH:mm")
          : "N/A",
      },
      {
        icon: Calendar,
        label: "Updated At",
        value: lead.updatedAt
          ? DateTime.fromISO(lead.updatedAt).toFormat("dd MMM yyyy, HH:mm")
          : "N/A",
      },
    ],
  },
  {
    title: "Message Details",
    className: "sm:col-span-2",
    fields: [
      {
        icon: Tag,
        label: "Subject",
        value: lead?.subject || "N/A",
      },
      {
        icon: MessageSquare,
        label: "Message",
        value: lead?.message || "N/A",
      },
    ],
  },
];
