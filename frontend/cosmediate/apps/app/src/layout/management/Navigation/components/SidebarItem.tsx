"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@cosmediate/ui/lib/utils";

import { ActiveTabDecoration } from "./ActiveTabDecoration";
import { VISIBLE_NAVBAR_ITEMS } from "../config";
import { RouteConfig } from "@app/types/shared";

const hasAnyMatchingSegment = (pathname: string, routePath: string) => {
  const normalizedPathname = pathname.replace(/\/$/, "");
  const normalizedRoutePath = routePath.replace(/\/$/, "");

  // Extract only the first path segment from route path
  const firstSegment = normalizedRoutePath.split("/")[1] || "";
  const firstSegmentPath = `/${firstSegment}`;

  // console.log({
  //   normalizedPathname,
  //   normalizedRoutePath,
  //   firstSegment,
  //   firstSegmentPath,
  // });

  return (
    normalizedPathname === normalizedRoutePath ||
    normalizedPathname.startsWith(`${firstSegmentPath}/`) ||
    normalizedPathname === firstSegmentPath
  );
};

export const SidebarItem: React.FC<{
  route: RouteConfig;
  index: number;
}> = React.memo(({ route, index }) => {
  const pathname = usePathname();
  const isActiveLink = hasAnyMatchingSegment(pathname, route.path);
  const Icon = route.icon;

  return (
    <li data-active={isActiveLink ? "true" : "false"} className="relative">
      <Link
        href={route.path}
        aria-label={route.label}
        className={cn(
          "flex items-center space-y-[12px] justify-center text-900 flex-col max-sm:w-full",
          "px-[8px] py-[10px] max-lg:py-[15px] max-sm:px-[20px] max-sm:pb-2",
          { "max-sm:px-0 max-sm:py-0": index >= VISIBLE_NAVBAR_ITEMS },
          {
            "max-sm:bg-transparent":
              isActiveLink && index >= VISIBLE_NAVBAR_ITEMS,
          },
          isActiveLink
            ? "bg-white rounded-l-[16px] max-lg:rounded-l-none max-lg:rounded-b-[12px]"
            : "hover:bg-primary-accent/5 hover:rounded-[16px]"
        )}
      >
        <ActiveTabDecoration isActiveLink={isActiveLink} index={index} />

        {Icon && (
          <span className="flex items-center justify-center">
            <Icon size={20} color={isActiveLink ? "#6968EC" : "#8F95A9"} />
          </span>
        )}

        <span
          className={cn(
            "flex items-center justify-center text-[8px] break-words w-[55px] uppercase font-medium max-sm:leading-[10px] max-sm:!mt-1.5 leading-[10px] tracking-[2%] text-center text-400",
            isActiveLink && "text-primary-accent",
            "max-sm:hidden"
          )}
        >
          {route.label}
        </span>
      </Link>
    </li>
  );
});

SidebarItem.displayName = "SidebarItem";
