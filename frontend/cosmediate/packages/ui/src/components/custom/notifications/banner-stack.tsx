"use client";

import React, { useState } from "react";

import { cn } from "@cosmediate/ui/lib/utils";

import {
  BannerNotification,
  type BannerNotificationProps,
} from "./banner-notification";

export interface BannerStackItem extends BannerNotificationProps {
  id: string;
}

export interface BannerStackProps {
  items: BannerStackItem[];
  className?: string;
}

/** Compact card min-height minus peek — drives overlap in collapsed mode. */
const STACK_OVERLAP_PX = 42;
const STACK_EASING = "cubic-bezier(0.21, 1.02, 0.73, 1)";

export const BannerStack = ({ items, className }: BannerStackProps) => {
  const visibleItems = items.filter((item) => item.show !== false);
  const [expanded, setExpanded] = useState(false);

  if (!visibleItems.length) return null;

  const count = visibleItems.length;
  const isStacked = count > 1;
  const collapsed = isStacked && !expanded;

  return (
    <div
      className={cn(
        "pointer-events-none fixed top-4 left-1/2 z-60 w-[min(calc(100vw-1.5rem),48rem)] -translate-x-1/2",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full flex-col",
          !collapsed && "gap-2",
        )}
        onMouseEnter={() => isStacked && setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {visibleItems.map((item, index) => {
          const { id, className: itemClassName, ...bannerProps } = item;
          const isFront = index === 0;

          return (
            <div
              key={id}
              className={cn(
                "w-full transition-[margin,transform,opacity] duration-300",
                collapsed && !isFront && "pointer-events-none",
              )}
              style={{
                zIndex: count - index,
                marginTop:
                  collapsed && index > 0 ? -STACK_OVERLAP_PX : undefined,
                transform:
                  collapsed && index > 0
                    ? `scale(${Math.max(0.94, 1 - index * 0.008)})`
                    : undefined,
                transformOrigin: "top center",
                transitionTimingFunction: STACK_EASING,
              }}
            >
              <BannerNotification
                {...bannerProps}
                show
                compact={collapsed}
                dismissible={collapsed ? isFront && bannerProps.dismissible : bannerProps.dismissible}
                className={itemClassName}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
