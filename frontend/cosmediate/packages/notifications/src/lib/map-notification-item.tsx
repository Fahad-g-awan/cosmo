import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";

import type {
  AnnouncementSeverity,
  NotificationItem,
} from "@cosmediate/type-utils";
import type { BannerNotificationVariant } from "@cosmediate/ui";
import { Button } from "@cosmediate/ui";

import { getNotificationItemKey } from "./get-notification-item-key";
import type { ResolvedBannerItem, UserNotificationRegistry } from "../types";

const severityToVariant = (
  severity: AnnouncementSeverity | "WARNING",
): BannerNotificationVariant => {
  switch (severity) {
    case "SUCCESS":
      return "success";
    case "WARNING":
      return "warning";
    case "ERROR":
      return "error";
    case "INFO":
    default:
      return "info";
  }
};

const severityIcon = (variant: BannerNotificationVariant) => {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="size-4" />;
    case "warning":
      return <AlertTriangle className="size-4" />;
    case "error":
      return <XCircle className="size-4" />;
    case "info":
    default:
      return <Info className="size-4" />;
  }
};

const isExternalHref = (href: string) => /^https?:\/\//i.test(href);

const buildActionButton = (label: string, href: string) => {
  const className =
    "h-8 shrink-0 bg-primary px-3 text-xs font-medium text-primary-foreground shadow-none hover:bg-primary/90";

  if (isExternalHref(href)) {
    return (
      <Button asChild size="sm" className={className}>
        <a href={href} rel="noopener noreferrer">
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild size="sm" className={className}>
      <Link href={href}>{label}</Link>
    </Button>
  );
};

export const createMapNotificationItemToBanner = (
  registry: UserNotificationRegistry,
  resolveActionHref: (path: string) => string = (path) => path,
) => {
  return (item: NotificationItem): ResolvedBannerItem => {
    if (item.source === "announcement") {
      const variant = severityToVariant(item.severity);

      return {
        id: getNotificationItemKey(item),
        announcementId: item.id,
        source: item.source,
        title: item.title,
        description: item.message,
        icon: severityIcon(variant),
        variant,
        dismissible: item.dismissible,
        btnAction: item.action
          ? buildActionButton(item.action.label, item.action.href)
          : undefined,
      };
    }

    if (item.source === "system") {
      const variant = severityToVariant(item.severity);

      return {
        id: getNotificationItemKey(item),
        source: item.source,
        title: item.title,
        description: item.message,
        icon: severityIcon(variant),
        variant,
        dismissible: item.dismissible,
      };
    }

    const registryEntry = registry[item.code];
    const Icon = registryEntry.icon;

    return {
      id: getNotificationItemKey(item),
      source: item.source,
      title: registryEntry.title,
      description: registryEntry.description,
      icon: <Icon className="size-4" />,
      variant: registryEntry.variant,
      dismissible: registryEntry.dismissible,
      btnAction: registryEntry.action
        ? buildActionButton(
            registryEntry.action.label,
            resolveActionHref(registryEntry.action.path),
          )
        : undefined,
    };
  };
};

export type { ResolvedBannerItem };
