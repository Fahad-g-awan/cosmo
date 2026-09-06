import { FiltersConfig, PreferencesConfig } from "@cosmediate/browse-manager";
import { ReactNode } from "react";

export interface BrowseLayoutConfig {
  filters: FiltersConfig;
  preferences: PreferencesConfig;
  customHeader?: ReactNode;
  customControlBar?: ReactNode;
  showItemCount?: boolean;
  forceGridViewBelowTab?: boolean;
}
