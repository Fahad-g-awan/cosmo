import {
  Clinic,
  ClinicCategory,
  ClinicManager,
  Gender,
  UserStatus,
} from "@cosmediate/type-utils";

// Clinic API Request Types
export interface GetClinicRequest {
  id: string;
  from?: string;
}

export interface GetClinicsRequest {
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

export type ClinicStatus = "ACTIVE" | "BLOCKED" | "PENDING";
export type ClinicTypeEnum = "PARENT" | "NODE";

export interface CreateClinicRequest {
  // Required fields
  clinicType: ClinicTypeEnum;
  email: string;
  name: string;
  phone: string;
  status: ClinicStatus;
  available: boolean;

  // Optional fields
  clinicLogo?: File;
  clinicImages?: File[];
  categories?: string[];
  clinicAge?: string;
  htmlAbout?: string;
  overview?: string;
  instagramId?: string;
  website?: string;
  country?: string;
  state?: string;
  city?: string;
  completeAddress?: string;
  postalCode?: string;
  faqs?: string;
  tags?: string[];
  workingHours?: string;
  certificates?: string;

  // For NODE clinics
  parentClinicId?: string;

  // For new manager (when creating PARENT clinic)
  managerEmail?: string;
  managerFirstName?: string;
  managerLastName?: string;
  managerPhone?: string;

  // For existing managers (when creating NODE clinic)
  managerIds?: string[];
}

export interface UpdateClinicRequest {
  id: string;

  // Required fields (optional for update)
  clinicType?: ClinicTypeEnum;
  email?: string;
  name?: string;
  phone?: string;
  status?: ClinicStatus;
  available?: boolean;

  // Optional fields
  clinicLogo?: File;
  clinicImages?: File[];
  categories?: string[];
  clinicAge?: string;
  htmlAbout?: string;
  overview?: string;
  instagramId?: string;
  website?: string;
  country?: string;
  state?: string;
  city?: string;
  completeAddress?: string;
  postalCode?: string;
  faqs?: string;
  tags?: string[];
  workingHours?: string;
  certificates?: string;

  // For NODE clinics
  parentClinicId?: string;

  // For new manager
  managerEmail?: string;
  managerFirstName?: string;
  managerLastName?: string;
  managerPhone?: string;

  // For existing managers
  managerIds?: string[];
}

export interface DeleteClinicRequest {
  id: string;
}

// Clinic API Response Types
export interface GetClinicResponse {
  success: boolean;
  message: string;
  item: Clinic;
}

export interface GetClinicsResponse {
  success: boolean;
  message: string;
  items: Clinic[];
  total: number;
  nextToken?: string;
}

export interface CreateClinicResponse {
  success: boolean;
  message: string;
  item: Clinic;
}

export interface UpdateClinicResponse {
  success: boolean;
  message: string;
  item: Clinic;
}

export interface DeleteClinicResponse {
  success: boolean;
  message: string;
}

// Clinic Category API Request Types
export interface GetClinicCategoryRequest {
  id: string;
}

export interface GetClinicCategoriesRequest {
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

export interface CreateClinicCategoryRequest {
  categories: string[];
  published?: boolean;
}

export interface UpdateClinicCategoryRequest {
  id: string;
  name: string;
  published?: boolean;
}

export interface DeleteClinicCategoryRequest {
  id: string;
}

// Clinic Category API Response Types
export interface GetClinicCategoryResponse {
  success: boolean;
  message: string;
  item: ClinicCategory;
}

export interface GetClinicCategoriesResponse {
  success: boolean;
  message: string;
  items: ClinicCategory[];
  total: number;
  nextToken?: string;
}

export interface CreateClinicCategoryResponse {
  success: boolean;
  message: string;
  item: ClinicCategory;
}

export interface UpdateClinicCategoryResponse {
  success: boolean;
  message: string;
  item: ClinicCategory;
}

export interface DeleteClinicCategoryResponse {
  success: boolean;
  message: string;
}

// Clinic Manager API Request Types
export interface GetClinicManagerRequest {
  id: string;
}

export interface GetClinicManagersRequest {
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

export interface CreateClinicManagerRequest {
  firstName: string;
  lastName: string;
  email: string;
  parentClinicId: string;
  clinicIds: string[];
  status: UserStatus;
  phone?: string;
  gender?: Gender;
  age?: number;
  country?: string;
  state?: string;
  city?: string;
  completeAddress?: string;
  postalCode?: string;
  managerImage?: File;
}

export interface UpdateClinicManagerRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  parentClinicId?: string;
  clinicIds?: string[];
  status?: UserStatus;
  phone?: string;
  gender?: Gender;
  age?: number;
  country?: string;
  state?: string;
  city?: string;
  completeAddress?: string;
  postalCode?: string;
  managerImage?: File;
}

export interface DeleteClinicManagerRequest {
  id: string;
}

// Clinic Manager API Response Types
export interface GetClinicManagerResponse {
  success: boolean;
  message: string;
  item: ClinicManager;
}

export interface GetClinicManagersResponse {
  success: boolean;
  message: string;
  items: ClinicManager[];
  total: number;
  nextToken?: string;
}

export interface CreateClinicManagerResponse {
  success: boolean;
  message: string;
  item: ClinicManager;
}

export interface UpdateClinicManagerResponse {
  success: boolean;
  message: string;
  item: ClinicManager;
}

export interface DeleteClinicManagerResponse {
  success: boolean;
  message: string;
}

// Popular Clinics API Types
export interface GetPopularClinicsRequest {
  limit?: number;
  filters?: {
    allowZeroRating?: boolean;
  };
}

export interface GetPopularClinicsResponse {
  success: boolean;
  message: string;
  items: Clinic[];
  total: number;
}

// Clinic Top Searched Treatments API Types
export interface GetClinicTopSearchedTreatmentsRequest {
  limit?: number;
}

export interface GetClinicTopSearchedTreatmentsResponse {
  success: boolean;
  message: string;
  items: unknown[];
  total: number;
}

// Clinics By Treatment ID API Types
export interface GetClinicsByTreatmentIdRequest {
  treatmentId?: string;
  search?: {
    query?: string;
  };
  filters?: Record<string, unknown> & {
    treatmentId?: string;
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

export interface GetClinicsByTreatmentIdResponse {
  success: boolean;
  message: string;
  items: Clinic[];
  total: number;
  nextToken?: string;
}
