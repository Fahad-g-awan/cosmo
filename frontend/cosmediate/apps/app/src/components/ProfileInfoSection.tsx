import React, { isValidElement } from "react";
import { cn } from "@cosmediate/ui/lib/utils";

type IconComponent = React.ComponentType<{ className?: string }>;

export interface ProfileInfoFieldItem {
  icon?: IconComponent | React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
}

export interface ProfileInfoSectionConfig {
  title: string;
  className?: string;
  fields: ProfileInfoFieldItem[];
}

const isIconComponent = (icon: unknown): icon is IconComponent => {
  if (typeof icon === "function") return true;

  return (
    typeof icon === "object" &&
    icon !== null &&
    "$$typeof" in icon &&
    "render" in icon &&
    typeof (icon as { render?: unknown }).render === "function"
  );
};

export const ProfileInfoSection = ({
  title,
  className,
  fields,
}: ProfileInfoSectionConfig) => {
  const renderIcon = (field: ProfileInfoFieldItem) => {
    if (!field.icon) return null;

    if (isValidElement(field.icon)) return field.icon;

    if (isIconComponent(field.icon)) {
      const Icon = field.icon;
      return (
        <Icon
          className={cn("w-5 h-5 text-400 shrink-0", field.iconClassName)}
        />
      );
    }

    return field.icon;
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col items-start justify-start gap-6",
        className
      )}
    >
      <h3 className="w-full text-lg font-semibold text-800 border-b pb-2">
        {title}
      </h3>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className="flex items-center gap-3">
            {renderIcon(field)}
            <div className="min-w-0">
              <p className="text-xs text-600 break-all">{field.label}</p>
              <p
                className={cn(
                  "font-medium break-all text-700 text-sm",
                  field.valueClassName
                )}
              >
                {field.value || "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
