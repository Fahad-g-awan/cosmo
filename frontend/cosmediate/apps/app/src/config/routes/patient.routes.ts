import { RouteConfig } from "@app/types/shared";

import { BiUserPin } from "react-icons/bi";

export const patientRoutes: RouteConfig[] = [
  {
    label: "Appointments",
    path: "/appointments",
    icon: BiUserPin,
  },
  {
    label: "Inbox",
    path: "/inbox",
    icon: BiUserPin,
  },
  {
    label: "Settings",
    path: "/settings/account/profile",
    icon: BiUserPin,
  },
];
