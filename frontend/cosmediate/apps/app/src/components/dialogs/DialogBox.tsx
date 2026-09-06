import React, { useCallback } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@cosmediate/ui/components/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@cosmediate/ui/components/drawer";
import { ButtonLoader } from "@cosmediate/ui";
import { useWindowWidth } from "@cosmediate/ui/hooks/useWindowWidth";
import { Button } from "@cosmediate/ui/components/button";
import { cn } from "@cosmediate/ui/lib/utils";
import { useDialog } from "@app/context/dialog/DialogProvider";

const isPromise = (value: unknown): value is Promise<unknown> =>
  value !== null &&
  typeof value === "object" &&
  typeof (value as Promise<unknown>).then === "function";

type DialogFooterButtonsProps = {
  isMobile?: boolean;
  isBusy: boolean;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const DialogFooterButtons = ({
  isMobile = false,
  isBusy,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: DialogFooterButtonsProps) => (
  <>
    <Button
      type="button"
      variant="outline"
      className={cn("py-2 capitalize", isMobile && "w-[50%]")}
      disabled={isBusy}
      onClick={onCancel}
    >
      {cancelLabel}
    </Button>

    <Button
      type="button"
      className={cn("min-w-20 py-2 capitalize", isMobile && "w-[50%]")}
      disabled={isBusy}
      onClick={onConfirm}
      aria-busy={isBusy}
    >
      {!isBusy && confirmLabel}
      {isBusy && <ButtonLoader />}
    </Button>
  </>
);

export const DialogBox = ({ children }: { children: React.ReactNode }) => {
  const { isMobileView } = useWindowWidth();
  const { dialog, closeDialog, updateDialogPayload } = useDialog();

  const isBusy = Boolean(dialog.payload?.isLoading);

  const title =
    dialog.dialogType === "delete"
      ? "Delete"
      : (dialog.payload?.title ?? "");

  const cancelLabel =
    dialog.dialogType === "delete"
      ? "Cancel"
      : (dialog.payload?.cancelLabel ?? "Cancel");

  const confirmLabel =
    dialog.dialogType === "delete"
      ? "Delete"
      : (dialog.payload?.confirmLabel ?? "Confirm");

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !isBusy) {
        closeDialog();
      }
    },
    [closeDialog, isBusy],
  );

  const handleCancel = useCallback(() => {
    if (isBusy) return;
    dialog.payload?.onCancel?.();
    closeDialog();
  }, [closeDialog, dialog.payload, isBusy]);

  const handleConfirm = useCallback(async () => {
    if (isBusy) return;

    const onConfirm = dialog.payload?.onConfirm;
    if (!onConfirm) return;

    const result = onConfirm();

    if (!isPromise(result)) {
      if (dialog.payload?.closeOnConfirm) {
        closeDialog();
      }
      return;
    }

    updateDialogPayload({ payload: { isLoading: true } });
    try {
      await result;
      if (dialog.payload?.closeOnConfirm) {
        closeDialog();
      }
    } finally {
      updateDialogPayload({ payload: { isLoading: false } });
    }
  }, [closeDialog, dialog.payload, isBusy, updateDialogPayload]);

  const footerButtons = (
    <DialogFooterButtons
      isMobile={isMobileView}
      isBusy={isBusy}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      onCancel={handleCancel}
      onConfirm={() => {
        void handleConfirm();
      }}
    />
  );

  if (isMobileView) {
    return (
      <Drawer open={dialog.open} onOpenChange={handleOpenChange}>
        <DrawerContent className={cn("w-full rounded-t-2xl sm:hidden")}>
          <DrawerHeader className="w-full flex items-center justify-start pb-6 px-0 font-medium text-left text-800">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>

          {children}

          <DrawerFooter className="w-full flex flex-row items-center justify-center gap-2 pt-3 pb-5">
            {footerButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={dialog.open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn("w-135 z-50 bg-ghost-blue rounded-xl max-sm:hidden")}
        onInteractOutside={(event) => {
          if (isBusy) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isBusy) event.preventDefault();
        }}
      >
        <DialogHeader className="pb-6 font-medium text-[12px] text-800">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {children}

        <DialogFooter className="w-full flex items-center justify-end gap-2">
          {footerButtons}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
