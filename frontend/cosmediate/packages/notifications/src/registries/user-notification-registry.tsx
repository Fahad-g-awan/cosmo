import {
  AlertTriangle,
  Building2,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";

import type { UserNotificationRegistry } from "../types";

export const USER_NOTIFICATION_REGISTRY: UserNotificationRegistry = {
  VERIFY_EMAIL: {
    title: "Verify your email",
    description:
      "Confirm your email address to secure your account and unlock full access.",
    variant: "warning",
    dismissible: false,
    icon: Mail,
    action: {
      label: "Account settings",
      path: "/settings/account/profile",
    },
  },
  PROFILE_INCOMPLETE: {
    title: "Complete your profile",
    description:
      "Add the required profile details so clinics and patients can recognize your account.",
    variant: "info",
    dismissible: false,
    icon: UserRound,
    action: {
      label: "Complete profile",
      path: "/settings/account/profile",
    },
  },
  DEFAULT_PASSWORD: {
    title: "Security alert",
    description:
      "Your account is using a default password. Change it now for better security.",
    variant: "warning",
    dismissible: false,
    icon: Lock,
    action: {
      label: "Change password",
      path: "/settings/account/security/manage-password",
    },
  },
  ACCOUNT_BLOCKED: {
    title: "Account blocked",
    description:
      "Your account is currently blocked. Contact support if you believe this is a mistake.",
    variant: "error",
    dismissible: false,
    icon: AlertTriangle,
  },
  CLINIC_PENDING: {
    title: "Clinic approval pending",
    description:
      "One or more clinics linked to your account are waiting for approval.",
    variant: "info",
    dismissible: false,
    icon: Building2,
    action: {
      label: "View clinics",
      path: "/clinic-management",
    },
  },
} satisfies UserNotificationRegistry;
