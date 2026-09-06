import type { ReactNode } from "react";
import type { UserRole } from "@cosmediate/type-utils";

import { CircleUser, LayoutDashboard, MessageSquareMore } from "lucide-react";
import { TbDoorExit } from "react-icons/tb";
import { SlSettings } from "react-icons/sl";
import { LuBriefcaseMedical } from "react-icons/lu";

import { getDefaultRouteForRole } from "@app/lib/routing/roleRouting";

export type ProfileMenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
  onClick?: () => void;
  danger?: boolean;
};

const ACCOUNT_PROFILE_PATH = "/settings/account/profile";
const INBOX_PATH = "/inbox";
const TREATMENTS_SELECTION_PATH = "/settings/treatments-management/selection";
const SERVICES_PATH = "/settings/treatments-management/services";

/**
 * Build profile menu links for dashboard dropdown / drawer.
 * Role-specific items are included only when relevant.
 */
export function getProfileMenuItems(params: {
  userRole: UserRole | null | undefined;
  onLogout: () => void;
  iconClassName?: string;
}): ProfileMenuItem[] {
  const { userRole, onLogout, iconClassName = "text-800" } = params;

  const items: ProfileMenuItem[] = [
    {
      label: "Dashboard",
      href: getDefaultRouteForRole(userRole ?? undefined),
      icon: <LayoutDashboard className={iconClassName} />,
    },
    {
      label: "My Profile",
      href: ACCOUNT_PROFILE_PATH,
      icon: <CircleUser className={iconClassName} />,
    },
    {
      label: "Inbox",
      href: INBOX_PATH,
      icon: <MessageSquareMore className={iconClassName} />,
    },
    {
      label: "Settings",
      href: ACCOUNT_PROFILE_PATH,
      icon: <SlSettings className={iconClassName} />,
    },
  ];

  if (userRole === "MANAGER") {
    items.push({
      label: "Treatments Management",
      href: TREATMENTS_SELECTION_PATH,
      icon: <LuBriefcaseMedical className={iconClassName} />,
    });
  }

  if (userRole === "SPECIALIST") {
    items.push({
      label: "Services",
      href: SERVICES_PATH,
      icon: <LuBriefcaseMedical className={iconClassName} />,
    });
  }

  items.push({
    label: "Logout",
    href: "#",
    icon: <TbDoorExit className="text-danger" />,
    onClick: onLogout,
    danger: true,
  });

  return items;
}
