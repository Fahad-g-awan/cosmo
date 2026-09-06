import api from "../../axiosInstance";
import { handleApiError, logApiResponse } from "../../lib/utils";
import type {
  GetBlogCategoryRequest,
  GetBlogCategoryResponse,
  GetBlogCategoriesRequest,
  GetBlogCategoriesResponse,
  CreateBlogCategoryRequest,
  CreateBlogCategoryResponse,
  UpdateBlogCategoryRequest,
  UpdateBlogCategoryResponse,
  DeleteBlogCategoryRequest,
  DeleteBlogCategoryResponse,
} from "../../types/blogCategory.types";

export const getBlogCategoryApi = async (
  params: GetBlogCategoryRequest
): Promise<GetBlogCategoryResponse> => {
  try {
    const response = await api.get<GetBlogCategoryResponse>(
      `/blogs/categories?id=${params.id}`
    );
    return logApiResponse(`/blogs/categories [GET]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBlogCategoriesApi = async (
  data: GetBlogCategoriesRequest
): Promise<GetBlogCategoriesResponse> => {
  try {
    const response = await api.post<GetBlogCategoriesResponse>(
      `/blogs/categories/list`,
      data
    );
    return logApiResponse(`/blogs/categories/list [POST]`, response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const createBlogCategoryApi = async (
  data: CreateBlogCategoryRequest,
  accessToken: string
): Promise<CreateBlogCategoryResponse> => {
  try {
    const response = await api.post<CreateBlogCategoryResponse>(
      "/blogs/categories",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/blogs/categories [POST]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateBlogCategoryApi = async (
  data: UpdateBlogCategoryRequest,
  accessToken: string
): Promise<UpdateBlogCategoryResponse> => {
  try {
    const response = await api.put<UpdateBlogCategoryResponse>(
      "/blogs/categories",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/blogs/categories [PUT]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

export const deleteBlogCategoryApi = async (
  params: DeleteBlogCategoryRequest,
  accessToken: string
): Promise<DeleteBlogCategoryResponse> => {
  try {
    const response = await api.delete<DeleteBlogCategoryResponse>(
      `/blogs/categories?id=${params.id}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return logApiResponse("/blogs/categories [DELETE]", response.data);
  } catch (error) {
    return handleApiError(error);
  }
};

// Export types
export type {
  GetBlogCategoryRequest,
  GetBlogCategoriesRequest,
  CreateBlogCategoryRequest,
  UpdateBlogCategoryRequest,
  DeleteBlogCategoryRequest,
  GetBlogCategoryResponse,
  GetBlogCategoriesResponse,
  CreateBlogCategoryResponse,
  UpdateBlogCategoryResponse,
  DeleteBlogCategoryResponse,
} from "../../types/blogCategory.types";
