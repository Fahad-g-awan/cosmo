const LOG_ACTION_OPTIONS = [
  { label: "Create", value: "CREATE" },
  { label: "Update", value: "UPDATE" },
  { label: "Delete", value: "DELETE" },
  { label: "Soft delete", value: "SOFT_DELETE" },
  { label: "Register", value: "REGISTER" },
  { label: "Sign in", value: "SIGN_IN" },
  { label: "Password set", value: "PASSWORD_SET" },
  { label: "Password update", value: "PASSWORD_UPDATE" },
  { label: "Link OAuth provider", value: "LINK_OAUTH_PROVIDER" },
  { label: "Treatment selection", value: "TREATMENT_SELECTION" },
];

const LOG_SCOPE_OPTIONS = [
  { label: "Admin", value: "ENTITY_TYPE#ADMIN" },
  { label: "Patient", value: "ENTITY_TYPE#PATIENT" },
  { label: "Specialist", value: "ENTITY_TYPE#SPECIALIST" },
  { label: "Clinic manager", value: "ENTITY_TYPE#CLINIC_MANAGER" },
  { label: "Clinic", value: "ENTITY_TYPE#CLINIC" },
  { label: "Clinic category", value: "ENTITY_TYPE#CLINIC_CATEGORY" },
  { label: "Lead", value: "ENTITY_TYPE#LEAD" },
  { label: "Treatment", value: "ENTITY_TYPE#TREATMENT" },
  { label: "Treatment category", value: "ENTITY_TYPE#TREATMENT_CATEGORY" },
  { label: "Sub-treatment", value: "ENTITY_TYPE#SUB_TREATMENT" },
  { label: "Treatment result", value: "ENTITY_TYPE#TREATMENT_RESULT" },
  { label: "Treatment brand", value: "ENTITY_TYPE#TREATMENT_BRAND" },
  { label: "Review", value: "ENTITY_TYPE#REVIEW" },
  { label: "Review reply", value: "ENTITY_TYPE#REVIEW_REPLY" },
  { label: "Blog", value: "ENTITY_TYPE#BLOG" },
  { label: "Blog category", value: "ENTITY_TYPE#BLOG_CATEGORY" },
];

export const formatLogEntityLabel = (value?: string | null): string => {
  if (!value) return "N/A";
  const normalized = value.replace(/^ENTITY_TYPE#/, "").replace(/_/g, " ");
  return normalized.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatLogActionLabel = (value?: string | null): string => {
  if (!value) return "N/A";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const pickFilterValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    const first = value.find((entry) => entry !== null && entry !== "");
    return first !== undefined ? String(first) : undefined;
  }
  if (value === null || value === undefined || value === "") return undefined;
  return String(value);
};

export const normalizePlatformLogListFilters = (
  filters?: Record<string, unknown>,
) => {
  if (!filters) return undefined;

  const normalized: Record<string, unknown> = {};

  const actorId = pickFilterValue(filters.actorId);
  if (actorId) normalized.actorId = actorId;

  const scope = pickFilterValue(filters.scope);
  if (scope) normalized.scope = scope;

  const action = pickFilterValue(filters.action);
  if (action) normalized.action = action;

  if (Array.isArray(filters.createdAt)) {
    normalized.createdAt = filters.createdAt;
  }

  return Object.keys(normalized).length ? normalized : undefined;
};

export const getLogActionFilterOptions = () => LOG_ACTION_OPTIONS;
export const getLogScopeFilterOptions = () => LOG_SCOPE_OPTIONS;

type ActorLogFields = {
  actorId?: string;
  actorDisplayName?: string;
  actorEmail?: string;
};

/** Prefer display name, then email, then id — from log list rows. */
export const resolveActorLabelFromLogs = (
  items: ActorLogFields[],
  actorId?: string,
): string | null => {
  if (!items.length) return null;

  const match = actorId
    ? (items.find((item) => item.actorId === actorId) ?? items[0])
    : items[0];

  return (
    match?.actorDisplayName?.trim() ||
    match?.actorEmail?.trim() ||
    match?.actorId?.trim() ||
    null
  );
};

export const buildActorScopedLogsTitle = (
  actorLabel: string | null,
  fallback = "admin audit logs",
) => (actorLabel ? `${actorLabel} — audit logs` : fallback);
