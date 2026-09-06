"use client";

import * as React from "react";
import { useRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@cosmediate/ui/lib/utils";
import { LucideIcon } from "lucide-react";

interface SecondaryTabsProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Root
> {
  orientation?: "horizontal" | "vertical";
}

const SecondaryTabsMain = React.createContext<{
  orientation: "horizontal" | "vertical";
}>({
  orientation: "vertical",
});

const SecondaryTabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  SecondaryTabsProps
>(({ className, orientation = "vertical", children, ...props }, ref) => {
  return (
    <SecondaryTabsMain.Provider value={{ orientation }}>
      <TabsPrimitive.Root
        ref={ref}
        className={cn(
          orientation === "vertical"
            ? "gap-0! space-x-2 flex flex-row w-auto max-lg:w-full max-lg:flex-col max-lg:space-y-4 max-lg:space-x-0"
            : "flex flex-col gap-4 w-auto",
          className
        )}
        orientation={orientation}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    </SecondaryTabsMain.Provider>
  );
});
SecondaryTabs.displayName = "SecondaryTabs";

interface SecondaryTabsListProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> {
  className?: string;
}

function SecondaryTabsList({ className, ...props }: SecondaryTabsListProps) {
  const { orientation } = React.useContext(SecondaryTabsMain);

  return (
    <div
      className={cn(
        "max-lg:w-full bg-primary-accent-lite rounded-xl",
        orientation === "vertical"
          ? "relative w-70 shrink-0 min-w-70 self-start"
          : "relative w-fit"
      )}
    >
      <div
        className={cn(
          "scrollbar-hide overflow-x-auto overflow-lite",
          orientation === "vertical"
            ? "w-full overflow-y-auto max-h-[500px] max-lg:max-h-none"
            : "w-auto"
        )}
      >
        <TabsPrimitive.List
          className={cn(
            "transition-all duration-200 bg-transparent overflow-x-auto overflowY",
            orientation === "vertical"
              ? "flex flex-col w-full h-max py-1.5 px-2 max-lg:py-2.5 max-lg:px-1"
              : "flex flex-row w-auto h-max py-1 flex-nowrap",
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}

interface SecondaryTabsTriggerProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> {
  className?: string;
  value: string;
  icon?: LucideIcon;
}

function SecondaryTabsTrigger({
  className,
  value,
  icon: Icon,
  children,
  ...props
}: SecondaryTabsTriggerProps) {
  const { orientation } = React.useContext(SecondaryTabsMain);

  return (
    <div
      className={cn(
        "relative",
        orientation === "vertical"
          ? "w-full my-1 max-lg:inline-flex max-lg:w-auto max-lg:my-0 max-lg:mx-1 max-lg:whitespace-nowrap"
          : "inline-flex mx-1 whitespace-nowrap"
      )}
    >
      <TabsPrimitive.Trigger
        className={cn(
          "transition-all duration-300 ease-in-out cursor-pointer",
          "text-sm flex items-center gap-3 rounded-lg font-medium",
          "data-[state=active]:bg-white data-[state=active]:text-primary-accent data-[state=active]:shadow-none data-[state=active]:hover:bg-white/80 data-[state=inactive]:hover:bg-primary-accent/10",
          "data-[state=inactive]:bg-transparent data-[state=inactive]:text-600",
          "hover:text-primary-accent/30",
          orientation === "vertical"
            ? "w-full px-4 py-3 justify-start"
            : "w-auto px-4 py-2",
          className
        )}
        value={value}
        {...props}
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" />}
        <span className="w-full truncate inline-block text-left">
          {children}
        </span>
      </TabsPrimitive.Trigger>
    </div>
  );
}

interface SecondaryTabsContentProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
> {
  className?: string;
}

function SecondaryTabsContent({
  className,
  ...props
}: SecondaryTabsContentProps) {
  const { orientation } = React.useContext(SecondaryTabsMain);

  return (
    <TabsPrimitive.Content
      className={cn(
        "bg-white",
        orientation === "vertical"
          ? "flex-1 ml-4 max-h-[620px] overflow-auto overflowY transition-opacity duration-300 ease-in-out max-xl:max-h-[700px] max-lg:h-full max-lg:ml-0 max-lg:overflow-hidden max-sm:mt-4 max-sm:w-full"
          : "w-full mt-4 overflow-auto transition-opacity duration-300 ease-in-out",
        className
      )}
      {...props}
    />
  );
}

interface TabItem {
  label: string;
  value: string;
  component: React.ReactNode;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function PanelTabs({
  tabs,
  defaultValue = tabs[0]?.value,
  className,
  orientation = "vertical",
}: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  const tabsListRef = useRef<HTMLDivElement>(null);

  return (
    <SecondaryTabs
      value={activeTab}
      onValueChange={setActiveTab}
      orientation={orientation}
      className={className}
    >
      <div ref={tabsListRef}>
        <SecondaryTabsList>
          {tabs.map((tab) => (
            <SecondaryTabsTrigger
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
            >
              {tab.label}
            </SecondaryTabsTrigger>
          ))}
        </SecondaryTabsList>
      </div>

      {tabs.map((tab) => (
        <SecondaryTabsContent
          key={tab.value}
          value={tab.value}
          className="h-full overflow-auto overflowY transition-all duration-300 ease-in-out"
        >
          {tab.component}
        </SecondaryTabsContent>
      ))}
    </SecondaryTabs>
  );
}

export {
  SecondaryTabs,
  SecondaryTabsList,
  SecondaryTabsTrigger,
  SecondaryTabsContent,
};
