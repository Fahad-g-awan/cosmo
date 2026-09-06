import { Specialist } from "@cosmediate/type-utils";

// Specialist API Request Types
export interface GetSpecialistRequest {
  id: string;
  from?: string;
}

export interface GetSpecialistsRequest {
  clinicId?: string;
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

export interface CreateSpecialistRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  clinicId?: string;
  yearsOfExperience?: string;
  education?: string;
  certifications?: string;
  specialistImage?: File;
}

export interface UpdateSpecialistRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  clinicId?: string;
  yearsOfExperience?: string;
  education?: string;
  certifications?: string;
  specialistImage?: File;
}

export interface DeleteSpecialistRequest {
  id: string;
}

// Specialist API Response Types
export interface GetSpecialistResponse {
  success: boolean;
  message: string;
  item: Specialist;
}

export interface GetSpecialistsResponse {
  success: boolean;
  message: string;
  items: Specialist[];
  total: number;
  nextToken?: string;
}

export interface CreateSpecialistResponse {
  success: boolean;
  message: string;
  item: Specialist;
}

export interface UpdateSpecialistResponse {
  success: boolean;
  message: string;
  item: Specialist;
}

export interface DeleteSpecialistResponse {
  success: boolean;
  message: string;
}

// Top Searched Specialists API Types
export interface GetTopSearchedSpecialistsRequest {
  limit?: number;
  filters?: {
    allowZeroSearchClicks?: boolean;
  };
}

export interface GetTopSearchedSpecialistsResponse {
  success: boolean;
  message: string;
  items: Specialist[];
  total: number;
}

// Specialists By Treatment ID API Types
export interface GetSpecialistsByTreatmentIdRequest {
  treatmentId: string;
  search?: {
    query?: string;
  };
  filters?: {
    createdDateFrom?: string;
    createdDateTo?: string;
    updatedDateFrom?: string;
    updatedDateTo?: string;
  };
  sort?: {
    by?: string;
    order?: string;
  };
  pagination?: {
    nextToken?: string;
    limit?: number;
  };
}

export interface GetSpecialistsByTreatmentIdResponse {
  success: boolean;
  message: string;
  items: Specialist[];
  total: number;
  nextToken?: string;
}
