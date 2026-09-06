"use client";

import React, { useState } from "react";
import { cn } from "@cosmediate/ui/lib/utils";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

export type InfoVariant = "error" | "warning" | "success" | "info";
export type InfoSize = "sm" | "md" | "lg";

export interface InfoProps {
  variant?: InfoVariant;
  size?: InfoSize;
  title?: string;
  message: string | React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variants: Record<
  InfoVariant,
  {
    bg: string;
    border: string;
    text: string;
    accent: string;
    icon: React.ElementType;
  }
> = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    accent: "bg-red-400",
    icon: AlertCircle,
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    accent: "bg-amber-400",
    icon: AlertTriangle,
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    accent: "bg-emerald-400",
    icon: CheckCircle2,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    accent: "bg-blue-400",
    icon: Info,
  },
};

const sizes: Record<
  InfoSize,
  { padding: string; icon: string; text: string; title: string }
> = {
  sm: {
    padding: "py-2 px-3",
    icon: "size-3.5",
    text: "text-xs",
    title: "text-xs",
  },
  md: {
    padding: "py-2.5 px-4",
    icon: "size-4",
    text: "text-sm",
    title: "text-sm",
  },
  lg: {
    padding: "py-3 px-5",
    icon: "size-5",
    text: "text-sm",
    title: "text-base",
  },
};

export const InfoMessage: React.FC<InfoProps> = ({
  variant = "info",
  size = "md",
  title,
  message,
  dismissible = false,
  onDismiss,
  className,
}) => {
  const [visible, setVisible] = useState(true);

  if (!visible || !message || message === "") return null;

  const v = variants[variant];
  const s = sizes[size];
  const Icon = v.icon;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      role="alert"
      className={cn(
        "w-full relative flex items-start gap-2.5 rounded-lg border overflow-hidden",
        v.bg,
        v.border,
        v.text,
        s.padding,
        className,
      )}
    >
      <div
        className={cn("absolute inset-y-0 left-0 w-1 rounded-l-lg", v.accent)}
      />

      <Icon
        className={cn("shrink-0 mt-0.5 opacity-80", s.icon)}
        strokeWidth={2}
      />

      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("font-semibold leading-snug", s.title)}>{title}</p>
        )}
        <div
          className={cn(
            "leading-relaxed opacity-90",
            s.text,
            title && "mt-0.5",
          )}
        >
          {message}
        </div>
      </div>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className="shrink-0 mt-0.5 rounded-md p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className={s.icon} />
        </button>
      )}
    </div>
  );
};
