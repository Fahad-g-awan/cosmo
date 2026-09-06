// ============================================
// BLOG API REQUEST TYPES
// ============================================

import { Blog, BlogStatus } from "@cosmediate/type-utils";

export interface GetBlogRequest {
  id: string;
  from?: "listing" | "search";
}

export interface GetBlogsRequest {
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

export interface CreateBlogRequest {
  title: string;
  content: string;
  tags: string[];
  overview?: string;
  blogImage?: string;
  status?: BlogStatus;
  publishedAt?: string;
  categoryId?: string;
}

export interface UpdateBlogRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  overview?: string;
  blogImage?: string;
  status?: BlogStatus;
  publishedAt?: string;
  categoryId?: string;
}

export interface DeleteBlogRequest {
  id: string;
}

export interface GetRelatedBlogsRequest {
  id: string;
  limit?: number;
}

export interface GetTopSearchedBlogsRequest {
  limit?: number;
  filters?: {
    allowZeroSearchClicks?: boolean;
  };
}

// ============================================
// BLOG API RESPONSE TYPES
// ============================================

export interface GetBlogResponse {
  success: boolean;
  message: string;
  item: Blog | null;
}

export interface GetBlogsResponse {
  success: boolean;
  message: string;
  items: Blog[];
  total?: number;
  nextToken?: string;
}

export interface CreateBlogResponse {
  success: boolean;
  message: string;
  item: Blog;
}

export interface UpdateBlogResponse {
  success: boolean;
  message: string;
  item: Blog;
}

export interface DeleteBlogResponse {
  success: boolean;
  message: string;
}

export interface GetRelatedBlogsResponse {
  success: boolean;
  message?: string;
  items: Blog[];
  total: number;
}

export interface GetTopSearchedBlogsResponse {
  success: boolean;
  message?: string;
  items: Blog[];
  total: number;
}
