"use client";

import { CancelAppointmentRequestDialog } from "@app/components/dialogs/CancelAppointmentRequestDialog";
import { NoShowAppointmentRequestDialog } from "@app/components/dialogs/NoShowAppointmentRequestDialog";
import { ConfirmDeleteDialog } from "@app/components/dialogs/ConfirmDeleteDialog";
import { BrowseFiltersDialog } from "@app/components/dialogs/BrowseFiltersDialog";
import { WorkingHoursDialog } from "@app/components/dialogs/WorkingHoursDialog";
import { CertificatesDialog } from "@app/components/dialogs/CertificatesDialog";
import { DialogBox } from "@app/components/dialogs/DialogBox";
import type { ActionDialogPayload } from "./types";
import { useDialog } from "./DialogProvider";

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

    case "browse-filters":
      return (
        <DialogBox>
          <BrowseFiltersDialog />
        </DialogBox>
      );

    case "cancel-appointment-request":
      return (
        <DialogBox>
          <CancelAppointmentRequestDialog />
        </DialogBox>
      );

    case "no-show-appointment":
      return (
        <DialogBox>
          <NoShowAppointmentRequestDialog />
        </DialogBox>
      );

    case "working-hours-dialog":
      return (
        <DialogBox>
          <WorkingHoursDialog />
        </DialogBox>
      );

    case "certificates-dialog":
      return (
        <DialogBox>
          <CertificatesDialog />
        </DialogBox>
      );

    default:
      return null;
  }
};
