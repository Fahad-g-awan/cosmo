import { ReactNode } from "react";

import { Histogram } from "@cosmediate/browse-manager/filters";

export interface BaseFilterConfig {
  id: string;
  label: string;
  description?: string;
}

export interface RangeFilterConfig extends BaseFilterConfig {
  type: "range";
  min: number;
  max: number;
  step: number;
  defaultValue: [number, number];
  unit?: string;
  formatValue?: (val: number) => string;
}

export interface RangeBarFilterConfig extends BaseFilterConfig {
  type: "range-bar";
  min: number;
  max: number;
  step: number;
  binCount: number;
  defaultValue: [number, number];
  unit?: string;
  histograms?: Histogram[];
}

export interface CheckboxFilterConfig extends BaseFilterConfig {
  type: "checkbox";
  options: Array<{
    label: string;
    value: string | number;
  }>;
  defaultValue: (string | number)[];
}

export interface RadioFilterConfig extends BaseFilterConfig {
  type: "radio";
  options: Array<{
    label: string;
    value: string | number;
  }>;
  defaultValue: string | number;
}

export interface SearchInputConfig {
  type: "input";
  id: string;
  placeholder: string;
  icon?: ReactNode;
}

export interface LocationSearchConfig {
  type: "location";
  id: string;
  placeholder: string;
  apiEndpoint?: string;
}

export interface DateTimeSearchConfig {
  type: "datetime";
  id: string;
  allowMultipleDates?: boolean;
  allowTimeRange?: boolean;
  minDate?: Date;
  maxDate?: Date;
}
