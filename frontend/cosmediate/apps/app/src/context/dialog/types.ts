import type { FiltersContextType as FiltersContext } from "@cosmediate/browse-manager";

export type DialogType =
  | "delete"
  | "action"
  | "browse-filters"
  | "cancel-appointment-request"
  | "no-show-appointment"
  | "certificates-dialog"
  | "working-hours-dialog";

export interface BaseDialogPayload {
  title?: string;
  primaryText?: string;
  secondaryText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
  closeOnConfirm?: boolean;
}

export type ActionDialogPayload = BaseDialogPayload;

export interface FiltersDialogPayload extends BaseDialogPayload {
  filtersContext: FiltersContext;
}

export type DialogPayload = FiltersDialogPayload | ActionDialogPayload;

export type DialogState = {
  open: boolean;
  dialogType: DialogType | null;
  payload: DialogPayload | null;
  id: string | null;
};

export type DialogAction = {
  type: "OPEN" | "CLOSE" | "UPDATE_PAYLOAD";
  dialogType?: DialogType | null;
  payload: DialogPayload | null;
  id?: string | null;
};
