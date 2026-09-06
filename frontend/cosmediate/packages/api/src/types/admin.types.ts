import { Admin } from "@cosmediate/type-utils";

// Admin API Request Types
export interface GetAdminRequest {
  id: string;
}

export interface GetAdminsRequest {
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

export interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  adminImage?: File;
}

export interface UpdateAdminRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  adminImage?: File;
}

export interface DeleteAdminRequest {
  id: string;
}

// Admin API Response Types
export interface GetAdminResponse {
  success: boolean;
  message: string;
  item: Admin;
}

export interface GetAdminsResponse {
  success: boolean;
  message: string;
  items: Admin[];
  total: number;
  nextToken: string;
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  item: Admin;
}

export interface UpdateAdminResponse {
  success: boolean;
  message: string;
  item: Admin;
}

export interface DeleteAdminResponse {
  success: boolean;
  message: string;
}
