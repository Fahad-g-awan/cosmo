"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Button,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { useMediaQuery } from "@cosmediate/ui/hooks/useMediaQuery";

import { Settings } from "lucide-react";
import { MobileDrawer } from "./MobileDrawer";

export type ActionMenuItem =
  | {
      type?: "item";
      label: React.ReactNode;
      icon?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
      destructive?: boolean;
    }
  | {
      type: "separator";
    };

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: React.ReactNode;
  triggerLabel?: string;
  align?: "start" | "center" | "end";
  className?: string;
  triggerClassName?: string;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  triggerIcon,
  triggerLabel,
  align = "end",
  className,
  triggerClassName,
}) => {
  const isMobile = useMediaQuery("mobile");
  const [open, setOpen] = useState(false);

  const RenderTriggerButton = (onClick?: () => void) => {
    return (
      <Button
        variant="outline"
        onClick={onClick}
        className={cn(
          "w-[36px] h-[36px] border border-stroke flex items-center justify-center gap-2 rounded-[12px]",
          triggerClassName
        )}
      >
        {triggerIcon || <Settings className="size-4 text-primary-accent" />}
        {triggerLabel && <span>{triggerLabel}</span>}
      </Button>
    );
  };

  // Mobile Drawer Version
  if (isMobile) {
    return (
      <>
        {RenderTriggerButton(() => setOpen(true))}

        <MobileDrawer
          open={open}
          onOpenChange={setOpen}
          title="Actions"
          //   confirmText=""
          //   cancelText="Close"
          //   onConfirm={() => {}}
          showButtons={false}
        >
          <div className="flex flex-col gap-1">
            {items.map((item, index) => {
              if (item.type === "separator") {
                return (
                  <div key={index} className="my-2 border-t border-stroke" />
                );
              }

              return (
                <button
                  key={index}
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                    item.destructive ? "text-destructive" : "text-800",
                    "hover:bg-muted"
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        </MobileDrawer>
      </>
    );
  }

  // Desktop Dropdown Version
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{RenderTriggerButton()}</DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className={cn("min-w-[200px] rounded-xl p-2", className)}
      >
        {items.map((item, index) => {
          if (item.type === "separator") {
            return <DropdownMenuSeparator key={index} />;
          }

          return (
            <DropdownMenuItem
              key={index}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                "flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2",
                item.destructive && "text-destructive focus:text-destructive"
              )}
            >
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionMenu;
