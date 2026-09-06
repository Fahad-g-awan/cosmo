import type { Item as BreadcrumbItemType } from "@cosmediate/ui/components/breadcrumb";
import { ReactNode, ComponentType } from "react";

// ============================================
// ENTITY TYPES
// ============================================

export type EntityType = "clinic" | "specialist" | "treatment";

export interface EntityHeaderData {
  name: string;
  image?: string;
  rating?: string;
  reviewCount?: string;
  address?: string;
}

// ============================================
// TAB CONFIGURATION
// ============================================

export interface TabComponentProps<T = unknown> {
  entity: T;
  setActiveTab: (tab: string) => void;
  activeTab: string;
}

export interface TabConfig<T = unknown> {
  id: string;
  label: string | ((entity: T) => string);
  component: ComponentType<TabComponentProps<T>>;
  props?: Record<string, unknown>;
}

// ============================================
// HEADER CONFIGURATION
// ============================================

export interface EntityHeaderConfig {
  type: "entity";
  entity: EntityHeaderData;
  entityType: EntityType;
}

export interface TitleHeaderConfig {
  type: "title";
  title: string;
}

export interface CustomHeaderConfig {
  type: "custom";
  content: ReactNode;
}

export type HeaderConfig =
  | EntityHeaderConfig
  | TitleHeaderConfig
  | CustomHeaderConfig;

// ============================================
// DETAIL LAYOUT CONFIG
// ============================================

export interface DetailLayoutConfig<T = unknown> {
  tabs: TabConfig<T>[];
  defaultTab?: string;
  breadcrumbs:
    | BreadcrumbItemType[]
    | ((activeTab: string, entity: T | null) => BreadcrumbItemType[]);
  header: HeaderConfig | ((entity: T | null) => HeaderConfig);
}

// ============================================
// DETAIL LAYOUT PROPS
// ============================================

export interface DetailLayoutProps<T = unknown> {
  entity: T | null;
  isLoading: boolean;
  SearchHeader?: ReactNode;
  config: DetailLayoutConfig<T>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  loadingComponent?: ReactNode;
  emptyComponent?: ReactNode;
}

// ============================================
// API SOURCE
// ============================================

export type ApiSource = "listing" | "search";
