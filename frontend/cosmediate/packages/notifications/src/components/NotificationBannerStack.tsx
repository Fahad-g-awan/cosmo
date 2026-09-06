"use client";

import { BannerStack } from "@cosmediate/ui";

import { useNotifications } from "../context/NotificationContext";

export const NotificationBannerStack = () => {
  const { items, dismiss } = useNotifications();

  return (
    <BannerStack
      items={items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        icon: item.icon,
        variant: item.variant,
        dismissible: item.dismissible,
        btnAction: item.btnAction,
        onDismiss: () => {
          void dismiss(item);
        },
      }))}
    />
  );
};
