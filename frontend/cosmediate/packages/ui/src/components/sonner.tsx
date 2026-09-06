"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export const DefaultToaster = ({ ...props }: ToasterProps) => {
  const { theme = "light" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-400" />,
        info: <InfoIcon className="size-4 text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-yellow-400" />,
        error: <OctagonXIcon className="size-4 text-red-400" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          closeButton:
            "!bg-primary !text-primary-foreground !hover:bg-primary/90 !font-medium px-3 !py-1 !rounded-[7px]",
          actionButton:
            "!bg-primary !text-primary-foreground !hover:bg-primary/90 !font-medium px-3 !py-1 !rounded-[7px]",
          cancelButton:
            "!bg-muted !text-muted-foreground !hover:bg-muted/80 !px-3 !py-1 !rounded-[7px]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--color-700)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-xl)",
          accentColor: "var(--primary)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};
