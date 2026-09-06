"use client";

import React, { createContext, useContext, useState } from "react";
import type { PanelHeaderConfig } from "@app/types/shared";

interface PanelHeaderContextType {
  panelHeaderConfig: PanelHeaderConfig | null;
  setPanelHeaderConfig: (config: PanelHeaderConfig) => void;
}

const PanelHeaderContext = createContext<PanelHeaderContextType | undefined>(
  undefined
);

export const PanelHeaderProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [panelHeaderConfig, setPanelHeaderConfig] =
    useState<PanelHeaderConfig | null>(null);

  return (
    <PanelHeaderContext.Provider
      value={{ panelHeaderConfig, setPanelHeaderConfig }}
    >
      {children}
    </PanelHeaderContext.Provider>
  );
};

export const usePanelHeader = () => {
  const context = useContext(PanelHeaderContext);
  if (context === undefined) {
    throw new Error("usePanelHeader must be used within a PanelHeaderProvider");
  }
  return context;
};
