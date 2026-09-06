import type {
  AnnouncementRole,
  AnnouncementSeverity,
  AnnouncementStatus,
  AnnouncementSurface,
} from "@cosmediate/type-utils";
import type { Announcement } from "@cosmediate/type-utils";

export interface AnnouncementFormValues extends Record<string, unknown> {
  title: string;
  message: string;
  severity: AnnouncementSeverity;
  status: AnnouncementStatus;
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  dismissible: boolean;
  targetRoles: AnnouncementRole[];
  targetSurfaces: AnnouncementSurface[];
  actionLabel?: string;
  actionUrl?: string;
}

export interface AnnouncementFormProps {
  initialData?: Partial<Announcement>;
  onSubmit: (data: AnnouncementFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel: string;
  isUpdate?: boolean;
}
