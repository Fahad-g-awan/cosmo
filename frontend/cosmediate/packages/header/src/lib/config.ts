import { CircleUser, LayoutDashboard, MessageSquareMore } from "lucide-react";
import { TbDoorExit } from "react-icons/tb";
import { SlSettings } from "react-icons/sl";

/** Cross-app `/dashboard…` shortcuts resolve to the app host. */
export const getMenuItems = () => {
  const menuItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      iconClasses: "text-700 size-5",
      icon: LayoutDashboard,
    },
    {
      label: "My Profile",
      href: "/dashboard/settings/account/profile",
      iconClasses: "text-700 size-5",
      icon: CircleUser,
    },
    {
      label: "Inbox",
      href: "/dashboard/inbox",
      iconClasses: "text-700 size-5",
      icon: MessageSquareMore,
    },
    {
      label: "Settings",
      href: "/dashboard/settings/account/profile",
      iconClasses: "text-700 size-5",
      icon: SlSettings,
    },
    {
      label: "Logout",
      iconClasses: "text-danger size-5",
      href: "#",
      icon: TbDoorExit,
    },
  ];

  return menuItems;
};
