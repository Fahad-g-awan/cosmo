"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@cosmediate/ui/lib/utils";
import "../../styles/tabs.css";

function PrimaryTabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function PrimaryTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "w-full text-muted-foreground flex items-center justify-center",
        className
      )}
      {...props}
    />
  );
}

function PrimaryTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "tabs-trigger relative cursor-pointer",
        "flex items-center justify-center gap-1.5 rounded-t-xl whitespace-nowrap transition-[color]",
        "hover:bg-cloud",
        "text-[14px] font-semibold text-500",
        "px-[16px] py-[12px] text-[14px]",
        "data-[state=active]:bg-white data-[state=active]:text-primary-accent",
        "dark:data-[state=active]:bg-input/30",
        "dark:text-muted-foreground",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function PrimaryTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { PrimaryTabs, PrimaryTabsList, PrimaryTabsTrigger, PrimaryTabsContent };
