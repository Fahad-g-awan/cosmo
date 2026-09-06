import {
  TreatmentCategory,
  Treatment,
  SubTreatment,
  TreatmentResult,
  TreatmentBrand,
  ClinicTreatment,
  ClinicSpecialistTreatment,
} from "@cosmediate/type-utils";

// ============================================
// CATEGORY API TYPES
// ============================================

export interface GetCategoryRequest {
  id: string;
}

export interface GetCategoriesRequest {
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

export interface CreateCategoryRequest {
  categories: string[];
  published: boolean;
}

export interface UpdateCategoryRequest {
  id: string;
  name: string;
  published: boolean;
}

export interface DeleteCategoryRequest {
  id: string;
}

export interface GetCategoryResponse {
  success: boolean;
  message?: string;
  item: TreatmentCategory | null;
}

export interface GetCategoriesResponse {
  success: boolean;
  message?: string;
  items: TreatmentCategory[];
  total: number;
  nextToken?: string;
}

export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  item: Array<{ category: string; id: string }>;
}

export interface UpdateCategoryResponse {
  success: boolean;
  message: string;
  item: TreatmentCategory;
}

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

// ============================================
// BRAND API TYPES
// ============================================

export interface GetBrandRequest {
  id: string;
}

export interface GetBrandsRequest {
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

export interface CreateBrandsRequest {
  brands: string[];
  published?: boolean;
}

export interface UpdateBrandRequest {
  id: string;
  name?: string;
  published?: boolean;
}

export interface DeleteBrandRequest {
  id: string;
}

export interface GetBrandResponse {
  success: boolean;
  message?: string;
  item: TreatmentBrand | null;
}

export interface GetBrandsResponse {
  success: boolean;
  message?: string;
  items: TreatmentBrand[];
  total: number;
  nextToken?: string;
}

export interface CreateBrandsResponse {
  success: boolean;
  message: string;
  item: Array<{ brand: string; id: string }>;
}

export interface UpdateBrandResponse {
  success: boolean;
  message: string;
  item: TreatmentBrand;
}

export interface DeleteBrandResponse {
  success: boolean;
  message: string;
}

// ============================================
// TREATMENT API TYPES
// ============================================

export interface GetTreatmentRequest {
  id: string;
  from?: string;
}

export interface GetTreatmentsRequest {
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

/**
 * FormData fields for create treatment:
 * - categoryId: string (required)
 * - name: string (required)
 * - published: string ("true" | "false") (required)
 * - treatmentImage: File (optional)
 * - overview: string (optional)
 * - htmlDescription: string (optional)
 * - recoveryTime: string (optional)
 * - anesthesia: string (optional)
 * - faqs: JSON string (optional)
 * - tags: JSON string (optional)
 */
export interface CreateTreatmentRequest {
  categoryId: string;
  name: string;
  published: boolean;
  treatmentImage?: File;
  overview?: string;
  htmlDescription?: string;
  recoveryTime?: string;
  anesthesia?: string;
  faqs?: Array<{ question: string; answer: string }>;
  tags?: string[];
}

/**
 * FormData fields for update treatment:
 * - id: string (required)
 * - categoryId: string (required)
 * - name: string (required)
 * - published: string ("true" | "false") (required)
 * - treatmentImage: File (optional)
 * - overview: string (optional)
 * - htmlDescription: string (optional)
 * - recoveryTime: string (optional)
 * - anesthesia: string (optional)
 * - faqs: JSON string (optional)
 * - tags: JSON string (optional)
 */
export interface UpdateTreatmentRequest {
  id: string;
  categoryId: string;
  name: string;
  published: boolean;
  treatmentImage?: File;
  overview?: string;
  htmlDescription?: string;
  recoveryTime?: string;
  anesthesia?: string;
  faqs?: Array<{ question: string; answer: string }>;
  tags?: string[];
}

export interface DeleteTreatmentRequest {
  id: string;
}

export interface GetTreatmentResponse {
  success: boolean;
  message?: string;
  item: Treatment | null;
}

export interface GetTreatmentsResponse {
  success: boolean;
  message: string;
  items: Treatment[];
  total?: number;
  nextToken?: string;
}

export interface CreateTreatmentResponse {
  success: boolean;
  message: string;
  item: Treatment;
}

export interface UpdateTreatmentResponse {
  success: boolean;
  message: string;
  item: Treatment;
}

export interface DeleteTreatmentResponse {
  success: boolean;
  message: string;
}

export interface GetTopSearchedTreatmentsRequest {
  limit?: number;
  filters?: {
    allowZeroSearchClicks?: boolean;
  };
}

export interface GetTopSearchedTreatmentsResponse {
  success: boolean;
  items: Treatment[];
  total: number;
}

// ============================================
// SUB-TREATMENT API TYPES
// ============================================

export interface GetSubTreatmentRequest {
  id: string;
}

export interface GetSubTreatmentsRequest {
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

export interface GetSubTreatmentResponse {
  success: boolean;
  message?: string;
  item: SubTreatment | null;
}

export interface GetSubTreatmentsResponse {
  success: boolean;
  message?: string;
  items: SubTreatment[];
  total: number;
  nextToken?: string;
}

export interface Histogram {
  priceFrom: number;
  priceTo: number;
  count: number;
}

export interface GetPriceFiltersDataResponse {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  binCount?: number;
  histograms: {
    clinic?: Histogram[];
    treatment?: Histogram[];
    brand?: Histogram[];
  };
}

// ============================================
// TREATMENT RESULT API TYPES
// ============================================

export interface GetTreatmentResultRequest {
  id: string;
}

export interface GetTreatmentResultsRequest {
  treatmentId?: string;
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

export interface CreateTreatmentResultRequest {
  clinicTreatmentId?: string;
  treatmentId?: string;
  ownerType?: "ADMIN" | "CLINIC";
  subcategoryId?: string;
  description: string;
  beforeImage: File;
  afterImage: File;
  isDefaultResult?: boolean;
  careOf?: {
    id: string;
    image: string;
    name: string;
    location: {
      country: string;
      city: string;
    };
    role: string;
  };
}

export interface UpdateTreatmentResultRequest {
  id: string;
  clinicTreatmentId?: string;
  treatmentId?: string;
  subcategoryId?: string;
  description?: string;
  beforeImage?: File;
  afterImage?: File;
  isDefaultResult?: boolean;
  careOf?: {
    id: string;
    image: string;
    name: string;
    location: {
      country: string;
      city: string;
    };
    role: string;
  };
}

export interface DeleteTreatmentResultRequest {
  id: string;
}

export interface GetTreatmentResultResponse {
  success: boolean;
  message?: string;
  item: TreatmentResult | null;
}

export interface GetTreatmentResultsResponse {
  success: boolean;
  message?: string;
  items: TreatmentResult[];
  total: number;
  nextToken?: string;
}

export interface CreateTreatmentResultResponse {
  success: boolean;
  message: string;
  item: TreatmentResult;
}

export interface UpdateTreatmentResultResponse {
  success: boolean;
  message: string;
  item: TreatmentResult;
}

export interface DeleteTreatmentResultResponse {
  success: boolean;
  message: string;
}

// ============================================
// CLINIC TREATMENT HUB API TYPES (Phase 6.2)
// ============================================

export type ClinicTreatmentItem = ClinicTreatment;

export interface ListClinicTreatmentsRequest {
  clinicId: string;
}

export interface ListClinicTreatmentsResponse {
  success: boolean;
  message: string;
  items: ClinicTreatmentItem[];
  total: number;
  nextToken?: string | null;
}

export interface SyncClinicTreatmentsRequest {
  clinicId: string;
  treatmentIds: string[];
}

export interface SyncClinicTreatmentsResponse {
  success: boolean;
  message: string;
  added: string[];
  removed: string[];
}

// ============================================
// CLINIC SUB-TREATMENT SYNC API TYPES (Phase 6.3)
// ============================================

export interface SyncClinicSubTreatmentsRequest {
  clinicTreatmentId: string;
  subTreatments: Array<{
    id?: string;
    name: string;
    price: number;
    duration: string;
    available: boolean;
    brandIds: string[];
  }>;
}

export interface SyncClinicSubTreatmentsResponse {
  success: boolean;
  message: string;
  clinicTreatmentId: string;
  items: SubTreatment[];
}

// ============================================
// CLINIC SPECIALIST TREATMENT API TYPES
// ============================================

export type ClinicSpecialistTreatmentItem = ClinicSpecialistTreatment;

export interface ListClinicSpecialistTreatmentsRequest {
  filters?: Record<string, unknown>;
  search?: {
    query?: string;
  };
  sort?: {
    by?: string;
    order?: "asc" | "desc";
  };
  pagination?: {
    limit?: number;
    nextToken?: string | null;
  };
}

export interface ListClinicSpecialistTreatmentsResponse {
  success: boolean;
  message?: string;
  items: ClinicSpecialistTreatmentItem[];
  total: number;
  nextToken?: string | null;
}

export interface SyncClinicAssignmentsRequest {
  clinicTreatmentId: string;
  assignments: Array<{
    specialistId: string;
    specialistExperience: string;
  }>;
}

export interface SyncClinicAssignmentsResponse {
  success: boolean;
  message: string;
  clinicTreatmentId: string;
  items: ClinicSpecialistTreatmentItem[];
}
