import { ReactNode } from "react";
import React from "react";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@cosmediate/ui";
import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui";

export const MobileDrawer = ({
  children,
  open,
  cancelText = "cancel",
  confirmText = "confirm",
  title,
  isLoading,
  onOpenChange,
  onConfirm,
  onCancel,
  showButtons = true,
}: {
  children: ReactNode;
  open: boolean;
  cancelText?: string;
  confirmText?: string;
  title?: string;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  showButtons?: boolean;
}) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn("w-full rounded-t-2xl")}>
        <DrawerHeader className="w-full flex items-center justify-start pb-6 px-0 font-medium text-800">
          {title && (
            <DrawerTitle className="w-full text-left">{title}</DrawerTitle>
          )}
        </DrawerHeader>

        <div className="min-h-[55vh] py-3 overflow-y-auto">{children}</div>

        {showButtons && (
          <DrawerFooter className="w-full flex flex-row items-center justify-center gap-2 p-1 pb-5">
            <DrawerClose asChild>
              <Button
                disabled={isLoading}
                type="button"
                variant="outline"
                className="py-2 w-[50%] capitalize"
                onClick={() => {
                  onCancel?.();
                  onOpenChange(false);
                }}
              >
                {cancelText}
              </Button>
            </DrawerClose>

            <Button
              disabled={isLoading}
              type="button"
              className="min-w-20 py-2 w-[50%] capitalize"
              onClick={() => {
                onConfirm?.();
                onOpenChange(false);
              }}
            >
              {confirmText}
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
