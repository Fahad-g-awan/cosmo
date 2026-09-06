import type { IconType } from "react-icons";

import { TbBuildingHospital, TbCategory, TbFileChart } from "react-icons/tb";
import { CalendarDays, Shield, UserPlus, Users } from "lucide-react";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { FiMail, FiSettings } from "react-icons/fi";
import { HiOutlineChartBar } from "react-icons/hi";
import { FaUserDoctor } from "react-icons/fa6";
import { RxDashboard } from "react-icons/rx";
import { BsFileText } from "react-icons/bs";
import { BiUserPin } from "react-icons/bi";

const DEFAULT_ICON = MdOutlineHealthAndSafety;

const NAVIGATION_ICONS: Record<string, IconType> = {
  clinicManagement: HiOutlineChartBar,
  specialists: FaUserDoctor,
  treatments: MdOutlineHealthAndSafety,
  patients: TbBuildingHospital,
  blogManagement: BsFileText,
  crm: Users,
  activityMonitoring: TbFileChart,
  auditTrail: BsFileText,
  moderation: Shield,
  controlPanel: Users,
  settings: FiSettings,
  analytics: RxDashboard,
  requests: UserPlus,
  inbox: FiMail,
  schedule: CalendarDays,
  reviews: BiUserPin,
  appointments: BiUserPin,
};

export const getNavigationIcon = (key: string): IconType => {
  if (NAVIGATION_ICONS[key]) return NAVIGATION_ICONS[key];

  const rootKey = key.split(".")[0];
  return NAVIGATION_ICONS[rootKey!] ?? DEFAULT_ICON;
};
