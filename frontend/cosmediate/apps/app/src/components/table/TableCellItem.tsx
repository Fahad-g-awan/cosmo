import React, { isValidElement } from "react";
import { cn } from "@cosmediate/ui/lib/utils";

type IconComponent = React.ComponentType<{ className?: string }>;

interface TableCellItemProps {
  icon?: IconComponent | React.ReactNode;
  value?: React.ReactNode;
  className?: string;
  iconClassName?: string;
  valueClassName?: string;
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

const TableCellItem = ({
  icon,
  value,
  className,
  iconClassName,
  valueClassName,
}: TableCellItemProps) => {
  const renderIcon = () => {
    if (!icon) return null;

    if (isValidElement(icon)) return icon;

    if (isIconComponent(icon)) {
      const Icon = icon;
      return <Icon className={cn("size-4 text-400 shrink-0", iconClassName)} />;
    }

    return icon;
  };

  return (
    <div className={cn("w-full flex items-center gap-2 min-w-0", className)}>
      {renderIcon()}
      <span className={cn("truncate min-w-0", valueClassName)}>
        {value ?? "N/A"}
      </span>
    </div>
  );
};

export default TableCellItem;
