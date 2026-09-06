"use client";

import { createContext, useContext, useReducer, ReactNode } from "react";
import { DialogState, DialogType, DialogAction, DialogPayload } from "./types";

interface DialogContextType {
  dialog: DialogState;
  openDialog({
    dialogType,
    payload,
  }: {
    dialogType: DialogType;
    payload: DialogPayload;
  }): void;
  updateDialogPayload({ payload }: { payload: Partial<DialogPayload> }): void;
  closeDialog(): void;
}

const initialState: DialogState = {
  open: false,
  dialogType: null,
  payload: null,
  id: null,
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

const reducer = (state: DialogState, action: DialogAction): DialogState => {
  switch (action.type) {
    case "OPEN":
      return {
        ...state,
        open: true,
        ...(action.dialogType && { dialogType: action.dialogType }),
        payload: action.payload,
      };

    case "UPDATE_PAYLOAD":
      return {
        ...state,
        payload: {
          ...state.payload,
          ...action.payload,
        },
      };

    case "CLOSE":
      return initialState;

    default:
      return state;
  }
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const openDialog = ({
    dialogType,
    payload,
  }: {
    dialogType: DialogType;
    payload: DialogPayload;
  }) => {
    dispatch({
      type: "OPEN",
      dialogType,
      payload,
    });
  };

  const updateDialogPayload = ({
    payload,
  }: {
    payload: Partial<DialogPayload>;
  }) => {
    dispatch({
      type: "UPDATE_PAYLOAD",
      payload,
    });
  };

  const closeDialog = () => {
    dispatch({
      type: "CLOSE",
      dialogType: null,
      payload: null,
    });
  };

  return (
    <DialogContext.Provider
      value={{
        dialog: state,
        openDialog,
        updateDialogPayload,
        closeDialog,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used inside DialogProvider");
  }
  return ctx;
};
