import type { Item as BreadcrumbItemType } from "@cosmediate/ui/components/breadcrumb";
import type { ProfileMessages } from "@cosmediate/i18n";

import type { DetailLayoutConfig, HeaderConfig, TabConfig } from "./types";

/**
 * Resolve breadcrumbs from config (function or static array)
 */
export const resolveBreadcrumbs = <T>(
  config: DetailLayoutConfig<T>,
  activeTab: string,
  entity: T | null,
): BreadcrumbItemType[] => {
  if (typeof config.breadcrumbs === "function") {
    return config.breadcrumbs(activeTab, entity);
  }
  return config.breadcrumbs;
};

/**
 * Resolve header config from config (function or static config)
 */
export const resolveHeaderConfig = <T>(
  config: DetailLayoutConfig<T>,
  entity: T | null,
): HeaderConfig => {
  if (typeof config.header === "function") {
    return config.header(entity);
  }
  return config.header;
};

/**
 * Get default tab from config
 */
export const getDefaultTab = <T>(config: DetailLayoutConfig<T>): string => {
  return config.defaultTab || config.tabs[0]?.id || "";
};

/**
 * Resolve tab label (function or static string)
 */
export const resolveTabLabel = <T>(
  label: TabConfig<T>["label"],
  entity: T,
): string => {
  if (typeof label === "function") {
    return label(entity);
  }
  return label;
};

/**
 * Capitalize first letter of string
 */
export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const resolveProfileTabLabel = (
  profile: ProfileMessages,
  tabId: string,
): string => {
  const tabs = profile.tabs as Record<string, string>;
  return tabs[tabId] ?? capitalizeFirst(tabId);
};

/**
 * Create standard profile breadcrumbs
 */
export const createDetailBreadcrumbs = (
  basePath: string,
  baseLabel: string,
  entityName: string,
  entityPath: string,
  activeTab: string,
  labels?: {
    home?: string;
    tabLabel?: (tabId: string) => string;
  },
): BreadcrumbItemType[] => {
  const breadcrumbs: BreadcrumbItemType[] = [
    { label: labels?.home ?? "Home", path: "/" },
    { label: baseLabel, path: basePath },
  ];

  if (entityName) {
    breadcrumbs.push({ label: entityName, path: entityPath });
  }

  if (activeTab && activeTab !== "about") {
    breadcrumbs.push({
      label: labels?.tabLabel?.(activeTab) ?? capitalizeFirst(activeTab),
      path: `${entityPath}?tab=${activeTab}`,
    });
  }

  return breadcrumbs;
};
