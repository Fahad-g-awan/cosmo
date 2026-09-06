import { RouteConfig } from "@app/types/shared";

import { TbBuildingHospital, TbFileChart } from "react-icons/tb";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { HiOutlineChartBar } from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { BsFileText } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import { Users, Shield } from "lucide-react";

export const adminRoutes: RouteConfig[] = [
  {
    label: "manage clinics",
    path: "/clinic-management",
    icon: HiOutlineChartBar,
  },
  {
    label: "specialists",
    path: "/specialists",
    icon: FaUserDoctor,
  },
  {
    label: "treatments",
    path: "/treatments",
    icon: MdOutlineHealthAndSafety,
  },
  {
    label: "patients",
    path: "/patients",
    icon: TbBuildingHospital,
  },
  {
    label: "blog management",
    path: "/blog-management",
    icon: BsFileText,
  },
  {
    label: "CRM",
    path: "/crm/leads",
    icon: Users,
  },
  {
    label: "monitor activity",
    path: "/activity-monitoring",
    icon: TbFileChart,
  },
  {
    label: "audit trail",
    path: "/audit-trail",
    icon: BsFileText,
  },
  {
    label: "moderation",
    path: "/moderation",
    icon: Shield,
  },
  {
    label: "control panel",
    path: "/control-panel/admins",
    icon: Users,
  },
  {
    label: "settings",
    path: "/settings/account/profile",
    icon: FiSettings,
  },
];
