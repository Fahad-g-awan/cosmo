export type DialogType = "delete" | "action";

export interface BaseDialogPayload {
  title?: string;
}

export interface ActionDialogPayload extends BaseDialogPayload {
  primaryText?: string;
  secondaryText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  closeOnConfirm?: boolean;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
}

export type DialogPayload = ActionDialogPayload;

export type DialogState = {
  open: boolean;
  dialogType: DialogType | null;
  payload?: Partial<DialogPayload> | null;
  id: string | null;
};

export type DialogAction = {
  type: "OPEN" | "CLOSE" | "UPDATE_PAYLOAD";
  dialogType?: DialogType | null;
  payload?: Partial<DialogPayload> | null;
  id?: string | null;
};
