export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  actorDisplayName: string;
  action: string;
  entity: string;
  clinicId: string | null;
  createdAt: string;
  logData?: Record<string, unknown>;
  orgRootId?: string | null;
  actorSub?: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorDisplayName: string;
  actorRole: string;
  action: string;
  scope: string;
  targetEntityId: string;
  targetName: string;
  feedLine: string;
  clinicId: string | null;
  occurredAt: string;
  logData?: Record<string, unknown>;
  orgRootId?: string | null;
  actorEmail?: string;
  actorSub?: string;
  createdAt?: string;
}
