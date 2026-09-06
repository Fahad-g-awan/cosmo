"use client";

import { toast } from "sonner";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToasterOptions = {
  action?: ToastAction;
  duration?: number;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  dismissible?: boolean;
  closeButton?: boolean;
  className?: string;
  icon?: React.ReactNode;
  id?: string;
};

export const Toaster = (
  message: string,
  type:
    | "default"
    | "success"
    | "error"
    | "warning"
    | "info"
    | "loading"
    | "promise" = "default",
  description?: string,
  options?: ToasterOptions
) => {
  const defaultOptions = {
    action: options?.action || {
      label: "Close",
      onClick: () => {},
    },
    description: description ? (
      <span className="text-foreground/80">{description}</span>
    ) : undefined,
    duration: options?.duration || 10000,
    position: options?.position || "bottom-center",
    // dismissible: options?.dismissible || true,
    // closeButton: options?.closeButton || true,

    ...options,
  };

  switch (type) {
    case "success":
      return toast.success(message, defaultOptions);
    case "error":
      return toast.error(message, defaultOptions);
    case "warning":
      return toast.warning(message, defaultOptions);
    case "info":
      return (
        toast.info?.(message, defaultOptions) || toast(message, defaultOptions)
      );
    case "loading":
      return (
        toast.loading?.(message, defaultOptions) ||
        toast(message, defaultOptions)
      );
    case "promise":
      return (
        toast.promise?.(message as any, defaultOptions) ||
        toast(message, defaultOptions)
      );
    default:
      return toast(message, defaultOptions);
  }
};
