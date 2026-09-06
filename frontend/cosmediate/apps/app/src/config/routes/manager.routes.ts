import { RouteConfig } from "@app/types/shared";

import { CalendarDays, UserPlus, Users } from "lucide-react";
import { FiMail, FiSettings } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { BiUserPin } from "react-icons/bi";
import { FaUserDoctor } from "react-icons/fa6";

export const managerRoutes: RouteConfig[] = [
  {
    label: "dashboard",
    path: "/analytics",
    icon: RxDashboard,
  },
  {
    label: "requests",
    path: "/requests",
    icon: UserPlus,
  },
  {
    label: "inbox",
    path: "/inbox",
    icon: FiMail,
  },
  {
    label: "schedule",
    path: "/schedule",
    icon: CalendarDays,
  },
  {
    label: "reviews",
    path: "/reviews",
    icon: BiUserPin,
  },
  {
    label: "patients",
    path: "/patients",
    icon: Users,
  },
  {
    label: "specialists",
    path: "/specialists",
    icon: FaUserDoctor,
  },
  {
    label: "control panel",
    path: "/control-panel/managers",
    icon: Users,
  },
  {
    label: "settings",
    path: "/settings/account/profile",
    icon: FiSettings,
  },
];
