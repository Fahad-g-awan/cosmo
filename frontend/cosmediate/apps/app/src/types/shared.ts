import { Clinic, Specialist, Treatment } from "@cosmediate/type-utils";
import type { IconType } from "react-icons";

export type Entity = Treatment | Specialist | Clinic;
export type EntityType = "treatment" | "specialist" | "clinic";

export type RouteConfig = {
  label: string;
  path: string;
  icon: IconType;
};

export type PanelHeaderConfig = {
  pageTitle: string;
  showActions: boolean;
  showSearch?: boolean;
  showExportBtn?: boolean;
  showAddBtn?: boolean;
  actionPath?: {
    label: string;
    link: string;
  };
};

/**
 * A recursive map:
 * - if it's a leaf → PanelHeaderConfig
 * - if it's a nested node → Record<string, PanelHeaderMap>
 */
export type PanelHeaderMap = {
  [key: string]: PanelHeaderConfig | PanelHeaderMap;
};
