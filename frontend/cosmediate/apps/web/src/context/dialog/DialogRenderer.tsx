"use client";

import { DialogBox } from "@web/components/dialogs/DialogBox";
import { ConfirmDeleteDialog } from "@web/components/dialogs/ConfirmDeleteDialog";
import { useDialog } from "./DialogProvider";
import type { ActionDialogPayload } from "./types";

export const DialogRenderer = () => {
  const { dialog } = useDialog();

  if (!dialog || !dialog.dialogType || !dialog.payload) return null;

  switch (dialog.dialogType) {
    case "delete":
      return (
        <DialogBox>
          <ConfirmDeleteDialog
            primaryText={(dialog.payload as ActionDialogPayload)?.primaryText}
            secondaryText={
              (dialog.payload as ActionDialogPayload)?.secondaryText
            }
          />
        </DialogBox>
      );

    // case "action":
    //   return (
    //     <DialogBox>
    //       <BrowseFiltersDialog />
    //     </DialogBox>
    //   );

    default:
      return null;
  }
};
