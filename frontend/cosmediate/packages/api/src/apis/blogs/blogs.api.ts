import api from "../../axiosInstance";
import { buildFlexibleMetricsQuery } from "../../lib/flexible-metrics-query";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetBlogRequest,
  GetBlogResponse,
  GetBlogsRequest,
  GetBlogsResponse,
  CreateBlogRequest,
  CreateBlogResponse,
  UpdateBlogRequest,
  UpdateBlogResponse,
  DeleteBlogRequest,
  DeleteBlogResponse,
  GetRelatedBlogsRequest,
  GetRelatedBlogsResponse,
  GetTopSearchedBlogsRequest,
  GetTopSearchedBlogsResponse,
} from "../../types/blog.types";

export const getBlogApi = async (
  params: GetBlogRequest
): Promise<GetBlogResponse> => {
  try {
    const response = await api.get<GetBlogResponse>(
      `/blogs?id=${params.id}&from=${params?.from || "listing"}`
    );
    return logApiResponse(`/blogs [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBlogsApi = async (
  data: GetBlogsRequest
): Promise<GetBlogsResponse> => {
  try {
    const response = await api.post<GetBlogsResponse>(`/blogs/list`, data);
    return logApiResponse(`/blogs/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createBlogApi = async (
  data: FormData,
  accessToken: string
): Promise<CreateBlogResponse> => {
  try {
    const response = await api.post<CreateBlogResponse>("/blogs", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/blogs [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateBlogApi = async (
  data: FormData,
  accessToken: string
): Promise<UpdateBlogResponse> => {
  try {
    const response = await api.put<UpdateBlogResponse>("/blogs", data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return logApiResponse("/blogs [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteBlogApi = async (
  params: DeleteBlogRequest,
  accessToken: string
): Promise<DeleteBlogResponse> => {
  try {
    const response = await api.delete<DeleteBlogResponse>(
      `/blogs?id=${params.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/blogs [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getRelatedBlogsApi = async (
  params: GetRelatedBlogsRequest
): Promise<GetRelatedBlogsResponse> => {
  try {
    const url = `/blogs/related?id=${params.id}${params.limit ? `&limit=${params.limit}` : ""}`;
    const response = await api.get<GetRelatedBlogsResponse>(url);
    return logApiResponse("/blogs/related [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getTopSearchedBlogsApi = async (
  params?: GetTopSearchedBlogsRequest
): Promise<GetTopSearchedBlogsResponse> => {
  try {
    const url = `/blogs/top-searched${buildFlexibleMetricsQuery(params)}`;
    const response = await api.get<GetTopSearchedBlogsResponse>(url);
    return logApiResponse("/blogs/top-searched [GET]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

// Export types
export type {
  GetBlogRequest,
  GetBlogsRequest,
  CreateBlogRequest,
  UpdateBlogRequest,
  DeleteBlogRequest,
  GetRelatedBlogsRequest,
  GetTopSearchedBlogsRequest,
  GetBlogResponse,
  GetBlogsResponse,
  CreateBlogResponse,
  UpdateBlogResponse,
  DeleteBlogResponse,
  GetRelatedBlogsResponse,
  GetTopSearchedBlogsResponse,
} from "../../types/blog.types";
