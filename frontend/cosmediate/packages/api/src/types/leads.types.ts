import { Lead } from "@cosmediate/type-utils";

// Lead API Request Types
export interface GetLeadRequest {
  id: string;
  from?: string;
}

export interface GetLeadsRequest {
  filters?: Record<string, unknown>;
  search?: Record<string, unknown>;
  sort?: {
    by: string;
    order: "asc" | "desc";
  };
  pagination?: {
    page?: number;
    limit?: number;
    nextToken?: string;
  };
}

export type CreateLeadRequest = Omit<
  Lead,
  "id" | "createdAt" | "updatedAt" | "status"
>;

export type UpdateLeadRequest = Omit<Lead, "createdAt" | "updatedAt">;

export interface DeleteLeadRequest {
  id: string;
}

// Lead API Response Types
export interface GetLeadResponse {
  success: boolean;
  message: string;
  item: Lead;
}

export interface GetLeadsResponse {
  success: boolean;
  message: string;
  items: Lead[];
  total: number;
  nextToken?: string;
}

export interface CreateLeadResponse {
  success: boolean;
  message: string;
  item: Lead;
}

export interface UpdateLeadResponse {
  success: boolean;
  message: string;
  item: Lead;
}

export interface DeleteLeadResponse {
  success: boolean;
  message: string;
}
