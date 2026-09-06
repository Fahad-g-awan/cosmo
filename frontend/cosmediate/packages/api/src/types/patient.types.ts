import { Patient } from "@cosmediate/type-utils";

export interface GetPatientRequest {
  id: string;
}

export interface GetPatientsRequest {
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

export interface CreatePatientRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  age?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  image?: File;
}

export interface UpdatePatientRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  age?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  patientImage?: File;
}

export interface DeletePatientRequest {
  id: string;
}

export interface GetPatientResponse {
  success: boolean;
  message: string;
  item: Patient;
}

export interface GetPatientsResponse {
  success: boolean;
  message: string;
  items: Patient[];
  total: number;
  nextToken: string;
}

export interface CreatePatientResponse {
  success: boolean;
  message: string;
  item: Patient;
}

export interface UpdatePatientResponse {
  success: boolean;
  message: string;
  item: Patient;
}

export interface DeletePatientResponse {
  success: boolean;
  message: string;
}
