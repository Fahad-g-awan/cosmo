import type { ActivityLog, AuditLog } from "@cosmediate/type-utils";

export interface PlatformLogsListRequest {
  filters?: {
    actorId?: string;
    scope?: string;
    action?: string;
    createdAt?: [string | null, string | null];
  };
  search?: {
    query?: string;
  };
  sort?: {
    by: string;
    order: "asc" | "desc";
  };
  pagination?: {
    limit?: number;
    nextToken?: string;
  };
}

export interface PlatformLogsListResponse<T> {
  success: boolean;
  message?: string;
  items: T[];
  total: number | null;
  nextToken: string | null;
  paginationMode: "cursor";
}

export interface PlatformLogGetRequest {
  id: string;
}

export interface PlatformLogGetResponse<T> {
  success: boolean;
  message?: string;
  item: T;
}

export type GetAuditLogsRequest = PlatformLogsListRequest;
export type GetAuditLogsResponse = PlatformLogsListResponse<AuditLog>;
export type GetAuditLogRequest = PlatformLogGetRequest;
export type GetAuditLogResponse = PlatformLogGetResponse<AuditLog>;

export type GetActivityLogsRequest = PlatformLogsListRequest;
export type GetActivityLogsResponse = PlatformLogsListResponse<ActivityLog>;
export type GetActivityLogRequest = PlatformLogGetRequest;
export type GetActivityLogResponse = PlatformLogGetResponse<ActivityLog>;
