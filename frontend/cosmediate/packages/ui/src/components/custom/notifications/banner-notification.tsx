import React from "react";
import { X } from "lucide-react";

import { cn } from "@cosmediate/ui/lib/utils";
import { Button } from "@cosmediate/ui/components/button";

export type BannerNotificationVariant =
  | "info"
  | "success"
  | "warning"
  | "error";

export interface BannerNotificationProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  btnAction?: React.ReactNode;
  variant?: BannerNotificationVariant;
  dismissible?: boolean;
  onDismiss?: () => void;
  show?: boolean;
  /** Compact stacked view — single-line summary; action button still shown when set. */
  compact?: boolean;
}

const variantClasses: Record<BannerNotificationVariant, string> = {
  info: "border-blue-300/80 bg-blue-100 text-blue-950",
  success: "border-emerald-300/80 bg-emerald-100 text-emerald-950",
  warning: "border-amber-300/80 bg-amber-100 text-amber-950",
  error: "border-rose-300/80 bg-rose-100 text-rose-950",
};

const iconWrapClasses: Record<BannerNotificationVariant, string> = {
  info: "bg-blue-200/70 text-blue-700",
  success: "bg-emerald-200/70 text-emerald-700",
  warning: "bg-amber-200/70 text-amber-800",
  error: "bg-rose-200/70 text-rose-700",
};

const descriptionClasses: Record<BannerNotificationVariant, string> = {
  info: "text-blue-900/85",
  success: "text-emerald-900/85",
  warning: "text-amber-950/85",
  error: "text-rose-900/85",
};

export const BannerNotification = ({
  title,
  description,
  icon,
  className,
  btnAction,
  variant = "info",
  dismissible,
  onDismiss,
  show = true,
  compact = false,
}: BannerNotificationProps) => {
  if (!show) return null;

  return (
    <div
      role="status"
      className={cn(
        "flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 shadow-sm sm:items-center sm:gap-3 sm:px-3.5",
        compact ? "min-h-13 sm:py-2.5" : "sm:py-3",
        variantClasses[variant],
        className,
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4",
          iconWrapClasses[variant],
        )}
      >
        {icon}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="min-w-0 flex-1">
          {compact ? (
            <p className="line-clamp-2 text-sm font-medium leading-snug sm:line-clamp-1">
              <span className="font-semibold capitalize">{title}</span>
              {description ? (
                <span
                  className={cn(
                    "ml-1.5 font-normal text-xs",
                    descriptionClasses[variant],
                  )}
                >
                  {description}
                </span>
              ) : null}
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold leading-tight capitalize">
                {title}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-[13px] leading-snug",
                  descriptionClasses[variant],
                )}
              >
                {description}
              </p>
            </>
          )}
        </div>

        {btnAction ? (
          <div
            className={cn(
              "shrink-0 self-stretch sm:self-auto [&_a]:w-full [&_button]:w-full sm:[&_a]:w-auto sm:[&_button]:w-auto",
              compact &&
                "sm:max-w-[34%] sm:[&_a]:truncate sm:[&_button]:truncate",
            )}
          >
            {btnAction}
          </div>
        ) : null}
      </div>

      {dismissible ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "size-7 shrink-0 rounded-lg text-current/55 hover:bg-black/5 hover:text-current",
          )}
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}
    </div>
  );
};
