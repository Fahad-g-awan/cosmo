import {
  FiMail as Mail,
  FiPhone as Phone,
  FiMapPin as MapPin,
} from "react-icons/fi";

import type { ProfileInfoSectionConfig } from "@app/components/ProfileInfoSection";
import { Specialist } from "@cosmediate/type-utils";

export const buildSpecialistDetailBasicInfoData = (
  entity: Specialist
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
];
