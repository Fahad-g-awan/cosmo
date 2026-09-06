// ============================================
// BLOG CATEGORY API REQUEST TYPES
// ============================================

import { BlogCategory } from "@cosmediate/type-utils";

export interface GetBlogCategoryRequest {
  id: string;
}

export interface GetBlogCategoriesRequest {
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

export interface CreateBlogCategoryRequest {
  categories: string[];
  published?: boolean;
}

export interface UpdateBlogCategoryRequest {
  id: string;
  name?: string;
  published?: boolean;
}

export interface DeleteBlogCategoryRequest {
  id: string;
}

// ============================================
// BLOG CATEGORY API RESPONSE TYPES
// ============================================

export interface GetBlogCategoryResponse {
  success: boolean;
  message?: string;
  item: BlogCategory | null;
}

export interface GetBlogCategoriesResponse {
  success: boolean;
  message?: string;
  items: BlogCategory[];
  total?: number;
  nextToken?: string;
}

export interface CreateBlogCategoryResponse {
  success: boolean;
  message: string;
  item: BlogCategory[];
}

export interface UpdateBlogCategoryResponse {
  success: boolean;
  message: string;
  item: BlogCategory;
}

export interface DeleteBlogCategoryResponse {
  success: boolean;
  message: string;
}
